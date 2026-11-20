import { NextResponse } from "next/server";
import { searchRecruitment, persistSearchResults } from "@/lib/recruitment-intelligence";

const rateWindow=new Map<string,{start:number,count:number}>();
function limited(request:Request){const forwarded=request.headers.get("x-forwarded-for")||"unknown";const ip=forwarded.split(",")[0].trim().slice(0,80);const now=Date.now();const current=rateWindow.get(ip);if(!current||now-current.start>60000){rateWindow.set(ip,{start:now,count:1});return false;}current.count++;return current.count>8;}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (limited(request)) return NextResponse.json({error:"Rate limit exceeded. Please wait a minute and retry."},{status:429});
  try {
    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query.trim().slice(0, 300) : "";
    const state = typeof body?.state === "string" ? body.state.trim().slice(0, 80) : "All States";
    const category = typeof body?.category === "string" ? body.category.trim().slice(0, 80) : "All Categories";
    if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });
    const result = await searchRecruitment(query, state, category);
    let persistence: {saved:number; skipped:boolean; reason?:string} = {saved:0,skipped:true,reason:"Not attempted"};
    if (result.items.length) { try { persistence = await persistSearchResults(result); } catch (e) { persistence = {saved:0,skipped:true,reason:e instanceof Error?e.message:"Persistence failed"}; } }
    return NextResponse.json({...result, persistence}, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recruitment search failed";
    return NextResponse.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
