import { NextRequest,NextResponse } from "next/server";
import { hashPassword,verifyPassword,setSession,clearSession,MarketingActor } from "@/lib/marketing-auth";
async function db(path:string,init:RequestInit={}){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Marketing database is not configured");
 const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=representation",...(init.headers||{})},cache:"no-store"});
 const body=await r.text();if(!r.ok)throw new Error(body||"Database request failed");return body?JSON.parse(body):[];
}
const validName=(s:string)=>/^[a-zA-Z0-9_.-]{3,32}$/.test(s);
export async function POST(req:NextRequest){
 try{
  const b=await req.json(),action=String(b.action||"login"),username=String(b.username||"").trim().toLowerCase(),password=String(b.password||"");
  if(action==="logout")return clearSession(NextResponse.json({ok:true}));
  if(!validName(username)||password.length<12||password.length>200)return NextResponse.json({error:"Use a valid username and a password of at least 12 characters."},{status:400});
  let user:any,role:"owner_admin"|"marketing_manager"="marketing_manager";
  if(action==="owner_login"){
   if(username!==(process.env.CSCSKB_OWNER_USERNAME||"admin").toLowerCase()||!process.env.CSCSKB_OWNER_PASSWORD_HASH||!verifyPassword(password,process.env.CSCSKB_OWNER_PASSWORD_HASH))return NextResponse.json({error:"Invalid username or password."},{status:401});
   const rows=await db("marketing_users?username=eq.admin&select=id,username,role,active&limit=1");
   user=rows[0];
   if(!user){const created=await db("marketing_users",{method:"POST",body:JSON.stringify({username:"admin",password_hash:process.env.CSCSKB_OWNER_PASSWORD_HASH,role:"owner_admin"})});user=created[0];}
   role="owner_admin";
  }else if(action==="login"){
   const rows=await db(`marketing_users?username=eq.${encodeURIComponent(username)}&select=id,username,password_hash,role,active&limit=1`);
   user=rows[0];if(!user||!user.active||!verifyPassword(password,user.password_hash))return NextResponse.json({error:"Invalid username or password."},{status:401});
   role=user.role;
  }else if(action==="register"){
   const email=String(b.email||"").trim().toLowerCase();
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Enter a valid email address."},{status:400});
   const rows=await db("marketing_users",{method:"POST",body:JSON.stringify({username,email,password_hash:hashPassword(password),role:"marketing_manager"})});
   user=rows[0];role="marketing_manager";
  }else return NextResponse.json({error:"Unsupported authentication action."},{status:400});
  const actor:MarketingActor={id:user.id,username:user.username,role};
  return setSession(NextResponse.json({ok:true,actor}),actor);
 }catch(e){const msg=e instanceof Error?e.message:"Authentication failed";return NextResponse.json({error:msg.includes("duplicate")?"Username or email is already registered.":msg},{status:400});}
}
