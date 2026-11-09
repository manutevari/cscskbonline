import { createHash } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { authenticateMarketingActor,unauthorized } from "@/lib/marketing-auth";
export const dynamic="force-dynamic";
async function db(path:string,init:RequestInit={}){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Marketing database is not configured");
 const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=representation",...(init.headers||{})},cache:"no-store"});
 const body=await r.text();if(!r.ok)throw new Error(body||"Database request failed");return body?JSON.parse(body):[];
}
const sha=(s:string)=>createHash("sha256").update(s,"utf8").digest("hex");
async function campaign(id:string){
 const rows=await db(`marketing_campaigns?id=eq.${encodeURIComponent(id)}&select=id,vertical,channel,draft_content,status,content_version,content_hash`);
 const c=rows[0];if(!c)throw new Error("Campaign not found");
 const actual=sha(c.draft_content);
 if(c.content_hash!==actual)throw new Error("Campaign content hash mismatch; run the HITL migration and verify campaign data.");
 return c;
}
export async function GET(req:NextRequest){
 const actor=authenticateMarketingActor(req);if(!actor)return unauthorized();
 try{
  const now=new Date().toISOString();
  const expired=await db(`approval_requests?select=id,resource_type,resource_id&status=eq.PENDING&expires_at=lt.${encodeURIComponent(now)}`);
  if(expired.length){await db(`approval_requests?status=eq.PENDING&expires_at=lt.${encodeURIComponent(now)}`,{method:"PATCH",body:JSON.stringify({status:"EXPIRED",updated_at:now})});await db("approval_events",{method:"POST",body:JSON.stringify(expired.map((x:any)=>({approval_request_id:x.id,resource_type:x.resource_type,resource_id:x.resource_id,event_type:"EXPIRED",actor_id:"system",actor_role:"system",details:{reason:"ttl_elapsed"}})))});}
  const status=req.nextUrl.searchParams.get("status")||"PENDING";
  const [approvals,events]=await Promise.all([
   db(`approval_requests?select=*&status=eq.${encodeURIComponent(status)}&order=created_at.desc&limit=100`),
   db("approval_events?select=*&order=created_at.desc&limit=100")
  ]);
  return NextResponse.json({approvals,events,actor});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to load approval queue"},{status:500});}
}
export async function POST(req:NextRequest){
 const actor=authenticateMarketingActor(req);if(!actor)return unauthorized();
 try{
  const b=await req.json(),action=String(b.action||"");
  if(action==="request"){
   if(!["owner_admin","marketing_manager","operations_manager"].includes(actor.role))return NextResponse.json({error:"Service Expert cannot submit campaign requests."},{status:403});
   const id=String(b.resource_id||"");if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Valid campaign id required."},{status:400});
   const c=await campaign(id);if(!["DRAFT","REJECTED"].includes(c.status))return NextResponse.json({error:"Campaign must be a draft or revised rejected campaign."},{status:409});
   const policies=await db("approval_policies?select=*&active=eq.true");
   const policy=policies.filter((p:any)=>(!p.vertical||p.vertical===c.vertical)&&(!p.channel||p.channel===c.channel))
    .sort((a:any,b:any)=>((b.vertical?2:0)+(b.channel?1:0))-((a.vertical?2:0)+(a.channel?1:0)) || ((b.risk_level==="CRITICAL"?4:b.risk_level==="HIGH"?3:b.risk_level==="MEDIUM"?2:1)-(a.risk_level==="CRITICAL"?4:a.risk_level==="HIGH"?3:a.risk_level==="MEDIUM"?2:1)))[0];
   if(!policy)throw new Error("No active approval policy matches this campaign.");
   const created=await db("approval_requests",{method:"POST",body:JSON.stringify({
    resource_type:"campaign",resource_id:id,action:"PUBLISH_CAMPAIGN",risk_level:policy.risk_level,
    content_version:c.content_version,content_hash:c.content_hash,content_snapshot:c.draft_content,
    requested_by:actor.id,requested_by_role:actor.role,required_roles:policy.required_roles,
    required_approvals:policy.required_approvals,expires_at:new Date(Date.now()+Number(policy.approval_ttl_minutes)*60000).toISOString()
   })});
   const a=created[0];
   await db("approval_events",{method:"POST",body:JSON.stringify({approval_request_id:a.id,resource_type:"campaign",resource_id:id,event_type:"REQUESTED",actor_id:actor.id,actor_role:actor.role,details:{risk_level:policy.risk_level,content_version:c.content_version,expires_at:a.expires_at,policy_key:policy.policy_key}})});
   await db(`marketing_campaigns?id=eq.${encodeURIComponent(id)}`,{method:"PATCH",body:JSON.stringify({status:"PENDING_APPROVAL"})});
   return NextResponse.json({approval:a,policy:policy.policy_key,message:"Approval requested. No content has been published or sent."},{status:201});
  }
  if(action==="decide"){
   const id=String(b.approval_id||""),decision=String(b.decision||"").toUpperCase();
   if(!/^[0-9a-f-]{36}$/i.test(id)||!["APPROVE","REJECT","REQUEST_CHANGES"].includes(decision))return NextResponse.json({error:"Invalid approval id or decision."},{status:400});
   const result=await db("rpc/decide_marketing_approval",{method:"POST",body:JSON.stringify({p_approval_id:id,p_actor_id:actor.id,p_actor_role:actor.role,p_decision:decision,p_comment:String(b.comment||"").slice(0,1000)})});
   return NextResponse.json({approval:result,message:result.status==="APPROVED"?"Approved for a separate execution step. Publishing is not automatic.":"Decision recorded."});
  }
  if(action==="pause_execution"||action==="resume_execution"){
   if(actor.role!=="owner_admin")return NextResponse.json({error:"Only Owner / Administrator can control the execution kill switch."},{status:403});
   const paused=action==="pause_execution";
   const rows=await db("marketing_execution_controls?id=eq.true",{method:"PATCH",body:JSON.stringify({paused,paused_by:actor.id,paused_at:paused?new Date().toISOString():null,reason:String(b.reason||"").slice(0,500),updated_at:new Date().toISOString()})});
   await db("approval_events",{method:"POST",body:JSON.stringify({event_type:paused?"EXECUTION_PAUSED":"EXECUTION_RESUMED",actor_id:actor.id,actor_role:actor.role,details:{reason:String(b.reason||"").slice(0,500)}})});
   return NextResponse.json({paused:rows[0]?.paused??paused});
  }
  return NextResponse.json({error:"Unsupported approval action."},{status:400});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Approval operation failed"},{status:400});}
}
