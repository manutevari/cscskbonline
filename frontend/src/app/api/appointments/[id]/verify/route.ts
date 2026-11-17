import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  const {id:token}=await params;
  if(!/^[A-Za-z0-9_-]{40,60}$/.test(token))return NextResponse.json({valid:false,message:"Appointment not found"},{status:404});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return NextResponse.json({error:"Verification service is not configured"},{status:503});
  const hash=createHash("sha256").update(token).digest("hex");
  const response=await fetch(`${url}/rest/v1/appointments?verification_token_hash=eq.${hash}&select=id,service,date,time,status`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:"no-store"});
  if(!response.ok)return NextResponse.json({error:"Verification lookup failed"},{status:502});
  const rows=await response.json();
  if(!rows.length)return NextResponse.json({valid:false,message:"Appointment not found"},{status:404});
  return NextResponse.json({valid:true,appointment:rows[0]},{headers:{"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
 }catch{return NextResponse.json({error:"Verification failed"},{status:500});}
}
