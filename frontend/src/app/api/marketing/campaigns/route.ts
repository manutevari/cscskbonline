import { createHash } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { authenticateMarketingActor,unauthorized } from "@/lib/marketing-auth";
const VERTICALS=["csc_services","tata_water","food_safety","insurance_banking"];
const CHANNELS=["whatsapp","facebook","instagram","google_business","email","website"];
async function db(path:string,init:RequestInit={}){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Marketing database is not configured");
 const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=representation",...(init.headers||{})},cache:"no-store"});
 const body=await r.text();if(!r.ok)throw new Error(body||"Database request failed");return body?JSON.parse(body):[];
}
async function draftWithAI(input:{vertical:string;channel:string;audience:string;objective:string;language:string}){
 const apiKey=process.env.OPENAI_API_KEY;
 if(apiKey){
  const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.CSCSKB_MARKETING_MODEL||"gpt-4o-mini",temperature:.6,messages:[
   {role:"system",content:"You are the CSCSKB marketing copilot. Draft accurate, ethical, locally relevant marketing copy. Never invent prices, offers, guarantees, government affiliation, product availability, regulatory approvals, insurance returns or eligibility. Use a clear CTA. Return only campaign copy."},
   {role:"user",content:`Business vertical: ${input.vertical}. Channel: ${input.channel}. Audience: ${input.audience}. Objective: ${input.objective}. Language: ${input.language}. Draft concise copy. Do not publish or send.`}
  ]})});
  if(!r.ok)throw new Error("AI drafting failed: "+await r.text());
  const data=await r.json();return data.choices?.[0]?.message?.content?.trim()||"AI returned an empty draft.";
 }
 const labels:Record<string,string>={csc_services:"CSC Services",tata_water:"Tata Water Distribution",food_safety:"Food Safety & FSSAI Consultancy",insurance_banking:"Insurance & Banking Services"};
 return `[${labels[input.vertical]||input.vertical}]\n\n${input.objective}\n\nWe are here to help ${input.audience||"customers"} understand the available services and next steps. Contact CSCSKB to discuss your requirements.\n\nVerify eligibility, documents, charges and availability with our team before proceeding.\n\nDraft for review — not published.`;
}
export async function GET(req:NextRequest){
 const actor=authenticateMarketingActor(req);if(!actor)return unauthorized();
 try{return NextResponse.json({campaigns:await db("marketing_campaigns?select=*&order=created_at.desc&limit=100"),actor});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to load campaigns"},{status:500});}
}
export async function POST(req:NextRequest){
 const actor=authenticateMarketingActor(req);if(!actor)return unauthorized();
 if(actor.role==="service_expert")return NextResponse.json({error:"Service Expert role is for domain review, not campaign authoring."},{status:403});
 try{
  const b=await req.json(),vertical=String(b.vertical||""),channel=String(b.channel||"");
  const name=String(b.name||"").trim().slice(0,120),audience=String(b.audience||"").trim().slice(0,300);
  const objective=String(b.objective||"").trim().slice(0,500),language=String(b.language||"hi");
  if(!VERTICALS.includes(vertical)||!CHANNELS.includes(channel)||!name||!objective)return NextResponse.json({error:"Valid vertical, channel, campaign name and objective are required."},{status:400});
  const draft_content=await draftWithAI({vertical,channel,audience,objective,language});
  const content_hash=createHash("sha256").update(draft_content,"utf8").digest("hex");
  const rows=await db("marketing_campaigns",{method:"POST",body:JSON.stringify({vertical,channel,name,audience,objective,language,draft_content,content_hash,created_by:actor.id,status:"DRAFT"})});
  const c=rows[0];
  await db("marketing_activities",{method:"POST",body:JSON.stringify({campaign_id:c.id,activity_type:"campaign_drafted",details:{vertical,channel,content_hash},actor:actor.id})});
  return NextResponse.json({campaign:c},{status:201});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to create campaign"},{status:500});}
}
export async function PATCH(){
 return NextResponse.json({error:"Direct campaign approval is disabled. Use POST /api/marketing/approvals with action=request or action=decide."},{status:410});
}
