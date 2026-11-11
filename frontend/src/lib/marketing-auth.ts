import { createHmac, timingSafeEqual, pbkdf2Sync, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
export type MarketingRole = "owner_admin" | "marketing_manager";
export type MarketingActor = { id:string; username:string; role:MarketingRole };
const COOKIE="cscskb_marketing_session";
const secret=()=>process.env.CSCSKB_MARKETING_SESSION_SECRET||"";
export function hashPassword(password:string,salt=randomBytes(16).toString("hex")) {
 const hash=pbkdf2Sync(password,salt,310000,32,"sha256").toString("hex");
 return `pbkdf2:310000:${salt}:${hash}`;
}
export function verifyPassword(password:string,stored:string) {
 const [kind,rounds,salt,expected]=stored.split(":");
 if(kind!=="pbkdf2"||!rounds||!salt||!expected)return false;
 const actual=pbkdf2Sync(password,salt,Number(rounds),32,"sha256").toString("hex");
 const a=Buffer.from(actual,"hex"),b=Buffer.from(expected,"hex");
 return a.length===b.length&&timingSafeEqual(a,b);
}
function sign(payload:string){const s=secret();if(!s)throw new Error("Marketing session secret is not configured");return createHmac("sha256",s).update(payload).digest("base64url");}
export function createSession(actor:MarketingActor){
 const payload=Buffer.from(JSON.stringify({...actor,exp:Date.now()+8*60*60*1000})).toString("base64url");
 return payload+"."+sign(payload);
}
export function readSession(req:NextRequest):MarketingActor|null {
 try{
  const raw=req.cookies.get(COOKIE)?.value||"",[payload,sig]=raw.split(".");
  if(!payload||!sig)return null;
  const expected=sign(payload),a=Buffer.from(sig),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))return null;
  const v=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
  if(!v.id||!v.username||!["owner_admin","marketing_manager"].includes(v.role)||v.exp<Date.now())return null;
  return {id:v.id,username:v.username,role:v.role};
 }catch{return null;}
}
export function setSession(res:NextResponse,actor:MarketingActor){
 res.cookies.set(COOKIE,createSession(actor),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:8*60*60});return res;
}
export function clearSession(res:NextResponse){res.cookies.set(COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0});return res;}
export function authenticateMarketingActor(req:NextRequest){return readSession(req);}
export function unauthorized(){return NextResponse.json({error:"Please sign in to continue."},{status:401});}
