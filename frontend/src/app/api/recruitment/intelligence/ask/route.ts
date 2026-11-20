import { NextResponse } from "next/server";
import { answerFromRecruitmentContext } from "@/lib/recruitment-intelligence";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const body=await request.json();
  const query=typeof body?.query==="string"?body.query.trim().slice(0,500):"";
  const state=typeof body?.state==="string"?body.state.trim().slice(0,80):"All States";
  const category=typeof body?.category==="string"?body.category.trim().slice(0,80):"All Categories";
  if(!query)return NextResponse.json({error:"query is required"},{status:400});
  const result=await answerFromRecruitmentContext(query,state,category);
  return NextResponse.json(result,{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch(error){
  const message=error instanceof Error?error.message:"Knowledge query failed";
  return NextResponse.json({error:message},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
