import { encodingForModel } from "js-tiktoken";
const enc = encodingForModel("gpt-4o");
export function chunkText(text: string) {
  const tokens = enc.encode(text || ""), size = 500, overlap = 75, step = size - overlap;
  const out: {text:string;token_count:number;start_token:number;end_token:number;chunk_index:number}[] = [];
  for (let start=0,index=0; start<tokens.length; start+=step,index++) {
    const part=tokens.slice(start,start+size);
    if (!part.length) break;
    out.push({text:enc.decode(part),token_count:part.length,start_token:start,end_token:start+part.length,chunk_index:index});
    if(start+size>=tokens.length) break;
  }
  return out;
}
export function normalizeUrl(value:string) { try { const u=new URL(value);u.hash="";u.search="";return u.toString().replace(/\\/$/,"").toLowerCase(); } catch { return value.toLowerCase().trim(); } }
export function authority(url:string) { try { const h=new URL(url).hostname.toLowerCase();if(h.endsWith(".gov.in")||h.endsWith(".nic.in")||h==="upsc.gov.in")return 1;if(h.endsWith(".ac.in")||h.endsWith(".edu"))return .82;if(["pib.gov.in","prsindia.org","indiabudget.gov.in","ncert.nic.in"].includes(h))return .9;return .35;}catch{return .2;} }
export function keyword(query:string,text:string) { const terms=[...new Set(query.toLowerCase().match(/[\\p{L}\\p{N}]{2,}/gu)||[])];return terms.length?terms.filter(t=>text.toLowerCase().includes(t)).length/terms.length:0; }
export function rankScore(x:{semantic:number;authority:number;keyword:number;freshness:number;evidence:number}) { const c=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));return Number((.35*c(x.semantic)+.25*c(x.authority)+.15*c(x.keyword)+.15*c(x.freshness)+.1*c(x.evidence)).toFixed(6)); }
