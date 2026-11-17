import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type Booking = {
  id: string; name: string; mobile: string; service: string; date: string; time: string;
  remarks?: string; status: "BOOKED" | "CONFIRMED" | "COMPLETED" | "CANCELLED"; created_at: string;
};
const OWNER_WHATSAPP = process.env.CSC_OWNER_WHATSAPP || "918937887070";
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;
const SLOT_START = 9 * 60, SLOT_END = 18 * 60, SLOT_STEP = 15;
function cleanPhone(value: string) { return value.replace(/\D/g, "").replace(/^0+/, ""); }
function toWhatsAppPhone(value: string) { const d=cleanPhone(value); return d.length===10?`91${d}`:d; }
function todayIST() {
 const p=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 return `${p.year}-${p.month}-${p.day}`;
}
function addDaysISO(iso:string,days:number){const d=new Date(`${iso}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function makeSlots(){return Array.from({length:(SLOT_END-SLOT_START)/SLOT_STEP},(_,i)=>{const s=SLOT_START+i*SLOT_STEP,e=s+SLOT_STEP;const fmt=(m:number)=>{const h24=Math.floor(m/60),h=h24%12||12;return `${String(h).padStart(2,"0")}:${String(m%60).padStart(2,"0")} ${h24>=12?"PM":"AM"}`;};return `${fmt(s)} - ${fmt(e)}`;});}
const SLOTS=makeSlots();
function makeId(){return `CSC-${todayIST().replaceAll("-","")}-${randomUUID().replaceAll("-","").slice(0,12).toUpperCase()}`;}
async function supabase(path:string,init:RequestInit={}){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("Supabase is not configured");const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=representation",...(init.headers||{})},cache:"no-store"});if(!r.ok)throw new Error(await r.text());return r.json();}
async function sendWhatsApp(to:string,a:Booking,role:"customer"|"owner",verificationToken:string){const token=process.env.WHATSAPP_ACCESS_TOKEN,id=process.env.WHATSAPP_PHONE_NUMBER_ID,template=role==="customer"?process.env.WHATSAPP_CUSTOMER_TEMPLATE:process.env.WHATSAPP_OWNER_TEMPLATE;if(!token||!id||!template)return{sent:false,reason:"whatsapp_not_configured"};const verificationUrl=`https://cscskb.online/verify/${encodeURIComponent(verificationToken)}`;const params=role==="customer"?[a.name,a.id,a.service,a.date,a.time,verificationUrl]:[a.id,a.name,a.mobile,a.service,a.date,a.time,a.status];const r=await fetch(`${GRAPH_URL}/${id}/messages`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:toWhatsAppPhone(to),type:"template",template:{name:template,language:{code:process.env.WHATSAPP_TEMPLATE_LANGUAGE||"en_US"},components:[{type:"body",parameters:params.map(text=>({type:"text",text:String(text)}))}]}})});return r.ok?{sent:true}:{sent:false,reason:"whatsapp_delivery_failed"};}
async function sendSMS(to:string,a:Booking,verificationToken:string){const authKey=process.env.MSG91_AUTH_KEY,templateId=process.env.MSG91_SMS_TEMPLATE_ID;if(!authKey||!templateId)return{sent:false,reason:"sms_not_configured"};const verificationUrl=`https://cscskb.online/verify/${encodeURIComponent(verificationToken)}`;const r=await fetch("https://control.msg91.com/api/v5/flow",{method:"POST",headers:{accept:"application/json",authkey:authKey,"content-type":"application/json"},body:JSON.stringify({template_id:templateId,recipients:[{mobiles:to.startsWith("91")?to:`91${to}`,VAR1:a.name,VAR2:a.id,VAR3:a.service,VAR4:a.date,VAR5:a.time,VAR6:verificationUrl}]})});return r.ok?{sent:true}:{sent:false,reason:"sms_delivery_failed"};}
function slotStartMinutes(time:string){const m=time.match(/^(\d{2}):(\d{2}) (AM|PM)/);if(!m)return -1;let h=Number(m[1])%12;if(m[3]==="PM")h+=12;return h*60+Number(m[2]);}
export async function POST(request:NextRequest){
 try{
  const b=await request.json();const name=String(b.name||"").trim().slice(0,100),mobile=cleanPhone(String(b.mobile||"")),service=String(b.service||"").trim().slice(0,120),date=String(b.date||"").trim(),time=String(b.time||"").trim(),remarks=String(b.remarks||"").trim().slice(0,500);
  if(!name||!/^\d{10}$/.test(mobile)||!service||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!SLOTS.includes(time))return NextResponse.json({error:"Invalid appointment details"},{status:400});
  const today=todayIST();if(date<today||date>addDaysISO(today,6))return NextResponse.json({error:"Please choose a date within the next 7 days."},{status:400});
  if(date===today&&slotStartMinutes(time)<=(()=>{const p=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());return Number(p.find(x=>x.type==="hour")?.value||0)*60+Number(p.find(x=>x.type==="minute")?.value||0);})())return NextResponse.json({error:"That time slot has already started or passed. Please choose another slot."},{status:400});
  const existing=await supabase(`appointments?date=eq.${encodeURIComponent(date)}&time=eq.${encodeURIComponent(time)}&status=in.(BOOKED,CONFIRMED)&select=id&limit=1`);if(existing.length)return NextResponse.json({error:"That time slot has just been booked. Please choose another slot.",code:"SLOT_BOOKED"},{status:409});
  const verificationToken=randomBytes(32).toString("base64url"),verificationTokenHash=createHash("sha256").update(verificationToken).digest("hex");
  const appointment:Booking={id:makeId(),name,mobile,service,date,time,remarks,status:"BOOKED",created_at:new Date().toISOString()};
  let inserted:Booking[];
  try{inserted=await supabase("appointments",{method:"POST",body:JSON.stringify({...appointment,verification_token_hash:verificationTokenHash})});}
  catch(e){if(String(e).includes("appointments_date_time_unique"))return NextResponse.json({error:"That time slot has just been booked. Please choose another slot.",code:"SLOT_BOOKED"},{status:409});throw e;}
  const saved=inserted[0]||appointment;
  const [customerWhatsApp,ownerWhatsApp,customerSMS]=await Promise.all([sendWhatsApp(mobile,saved,"customer",verificationToken),sendWhatsApp(OWNER_WHATSAPP,saved,"owner",verificationToken),sendSMS(mobile,saved,verificationToken)]);
  const verificationUrl=`https://cscskb.online/verify/${encodeURIComponent(verificationToken)}`;
  const safeAppointment={id:saved.id,name:saved.name,service:saved.service,date:saved.date,time:saved.time,status:saved.status,created_at:saved.created_at};
  return NextResponse.json({appointment:safeAppointment,qrUrl:`https://quickchart.io/qr?size=260&margin=2&text=${encodeURIComponent(verificationUrl)}`,verificationUrl,notifications:{customerWhatsApp,ownerWhatsApp,customerSMS}},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("Appointment booking failed:",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Unable to create appointment"},{status:500});}
}
