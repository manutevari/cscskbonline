import { NextRequest,NextResponse } from "next/server";
import { authenticateMarketingActor,unauthorized } from "@/lib/marketing-auth";
const VERTICALS=["csc_services","tata_water","food_safety","insurance_banking"] as const;
type Vertical=(typeof VERTICALS)[number];
async function db(path:string,init:RequestInit={}){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("Marketing database is not configured");
 const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=representation",...(init.headers||{})},cache:"no-store"});
 const body=await r.text();if(!r.ok)throw new Error(body||"Database request failed");return body?JSON.parse(body):[];
}
function score(input:{service_interest?:string;message?:string;email?:string}){let n=20;if(input.service_interest)n+=25;if(input.message&&input.message.length>20)n+=15;if(input.email)n+=10;return Math.min(n,70);}
export async function POST(req:NextRequest){
 try{
  const b=await req.json(),vertical=String(b.vertical||"") as Vertical,full_name=String(b.full_name||"").trim().slice(0,120),phone=String(b.phone||"").replace(/\D/g,"").slice(-10);
  const email=String(b.email||"").trim().slice(0,160)||null,city=String(b.city||"").trim().slice(0,100)||null;
  const service_interest=String(b.service_interest||"").trim().slice(0,160)||null,message=String(b.message||"").trim().slice(0,1500)||null;
  const source=String(b.source||"website").trim().slice(0,80),consent_to_contact=b.consent_to_contact===true;
  if(!VERTICALS.includes(vertical)||full_name.length<2||!/^\d{10}$/.test(phone)||!consent_to_contact)return NextResponse.json({error:"Valid name, 10-digit phone, business interest and contact consent are required."},{status:400});
  const rows=await db("marketing_leads",{method:"POST",body:JSON.stringify({vertical,full_name,phone,email,city,service_interest,message,source,consent_to_contact,lead_score:score({service_interest:service_interest||undefined,message:message||undefined,email:email||undefined})})});
  const lead=rows[0];await db("marketing_activities",{method:"POST",body:JSON.stringify({lead_id:lead.id,activity_type:"lead_created",details:{vertical,source},actor:"lead_capture"})});
  return NextResponse.json({success:true,lead_id:lead.id,message:"Your enquiry has been received. Our team will contact you."},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to save lead"},{status:500});}
}
export async function GET(req:NextRequest){
 const actor=authenticateMarketingActor(req);if(!actor)return unauthorized();
 try{
  const vertical=req.nextUrl.searchParams.get("vertical"),status=req.nextUrl.searchParams.get("status");
  const p=new URLSearchParams({select:"*",order:"created_at.desc",limit:"200"});
  if(vertical&&VERTICALS.includes(vertical as Vertical))p.set("vertical",`eq.${vertical}`);if(status)p.set("status",`eq.${status}`);
  return NextResponse.json({leads:await db(`marketing_leads?${p.toString()}`),actor});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to load leads"},{status:500});}
}
