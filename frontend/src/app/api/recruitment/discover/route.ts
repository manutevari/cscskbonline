import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function officialDomain(url: string) {
  try { const host = new URL(url).hostname.toLowerCase(); return host === "gov.in" || host.endsWith(".gov.in") || host === "nic.in" || host.endsWith(".nic.in") || host.endsWith(".edu.in"); } catch { return false; }
}
function categoryOf(text: string): string {
  const t=text.toLowerCase();
  if (/\bssc\b|staff selection/.test(t)) return "SSC";
  if (/railway|\brrb\b|\brrc\b/.test(t)) return "Railway";
  if (/bank|\bibps\b|\bsbi\b|rbi/.test(t)) return "Banking";
  if (/insurance|\blic\b|\bniacl\b|\bgic\b/.test(t)) return "Insurance";
  if (/teacher|teaching|\bctet\b|\btet\b|school|\bprt\b|\btgt\b|\bpgt\b/.test(t)) return "Teaching";
  if (/police|constable|sub.?inspector|\bsi\b/.test(t)) return "Police";
  if (/army|navy|air force|defence|defense|agniveer/.test(t)) return "Defence";
  if (/uppsc|upsssc|up police|uttar pradesh/.test(t)) return "UP";
  return "Other";
}
function vacancyCount(text: string): number | null {
  const patterns=[/(\d[\d,]*)\s*(?:vacancies|vacancy|posts?|positions?|पदों?|रिक्तियां|रिक्तियाँ)/ig,/(?:vacancies|vacancy|posts?|positions?|कुल पद|पदों? की संख्या|रिक्तियां|रिक्तियाँ)\s*[:\-]?\s*(\d[\d,]*)/ig];
  const values:number[]=[]; for(const re of patterns){let m:RegExpExecArray|null;while((m=re.exec(text))){const n=Number(m[1].replace(/,/g,""));if(n>0&&n<1000000)values.push(n);}} return values.length?Math.max(...values):null;
}
function dateMatch(text:string, labels:string[]):string|null {
  const date="(\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4}|\\d{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{4}|[A-Za-z]{3,9}\\s+\\d{1,2},?\\s+\\d{4})";
  for(const label of labels){const re=new RegExp(label+"\\s*(?:date)?\\s*[:\\-–]?\\s*"+date,"i");const m=re.exec(text);if(m)return m[1];}return null;
}
function extractDates(text:string){return {formStart:dateMatch(text,["application start","apply from","registration begins","form start","online application from","starting date"]),lastDate:dateMatch(text,["last date","closing date","application deadline","apply till","last date to apply"]),correctionDate:dateMatch(text,["correction window","correction date","edit window","application correction"]),examDate:dateMatch(text,["exam date","examination date","written exam","परीक्षा तिथि"]),notificationDate:dateMatch(text,["notification date","published","released","dated"])};}
function department(title:string,url:string,text:string):string{
 const t=(title+" "+url+" "+text.slice(0,1500)).toLowerCase();
 if(/staff selection commission|ssc\.gov/.test(t))return "Staff Selection Commission (SSC)";
 if(/railway recruitment|rrb|rrc|railway/.test(t))return "Indian Railways / RRB";
 if(/up police|uppbpb/.test(t))return "Uttar Pradesh Police Recruitment Board";
 if(/upsssc/.test(t))return "UPSSSC"; if(/uppsc/.test(t))return "UPPSC";
 if(/ibps/.test(t))return "Institute of Banking Personnel Selection"; if(/sbi/.test(t))return "State Bank of India";
 if(/lic/.test(t))return "Life Insurance Corporation"; if(/ctet|cbse/.test(t))return "CBSE / CTET";
 if(/navodaya|nvs/.test(t))return "Navodaya Vidyalaya Samiti"; if(/army|joinindianarmy/.test(t))return "Indian Army";
 if(/navy|joinindiannavy/.test(t))return "Indian Navy"; if(/air force|agnipathvayu/.test(t))return "Indian Air Force";
 try{return new URL(url).hostname;}catch{return "Department not identified";}
}
function postName(title:string){return title.replace(/\s*[|–—:-]\s*.*$/,"").replace(/recruitment|vacancy notification|notification/ig,"").trim()||"Post details in notice";}
export async function POST(request:Request){
 const apiKey=process.env.tavily_key||process.env.TAVILY_API_KEY;
 if(!apiKey)return NextResponse.json({error:"Tavily key missing in this deployment environment. Expected tavily_key or TAVILY_API_KEY.",configured:false},{status:503});
 let body:any;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request body."},{status:400});}
 const query=String(body.query||"").trim().slice(0,180);if(!query)return NextResponse.json({error:"Enter a recruitment search query."},{status:400});
 const jurisdiction=String(body.jurisdiction||"All India").slice(0,80),category=String(body.category||"All categories").slice(0,80);
 const searchQuery=[query,jurisdiction!=="All India"?jurisdiction:"",category!=="All categories"?category:"","government recruitment vacancy official notice application dates"].filter(Boolean).join(" ");
 try{
  const response=await fetch("https://api.tavily.com/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:apiKey,query:searchQuery,search_depth:"advanced",max_results:10,include_answer:false,include_raw_content:true}),cache:"no-store",signal:AbortSignal.timeout(20000)});
  if(!response.ok){const details=await response.text().catch(()=> "");return NextResponse.json({error:response.status===401||response.status===403?"Tavily rejected the configured key. Check the key value in Vercel.":"Tavily search request failed.",providerStatus:response.status,details:details.slice(0,300)},{status:502});}
  const data=await response.json();
  const notices=(Array.isArray(data.results)?data.results:[]).map((r:any)=>{
   const url=String(r.url||""),title=String(r.title||"Recruitment notice"),content=String(r.content||""),raw=String(r.raw_content||content),txt=title+"\n"+content+"\n"+raw,dates=extractDates(txt),cat=categoryOf(title+" "+url+" "+txt);
   return {title:title.slice(0,250),url,sourceDomain:(()=>{try{return new URL(url).hostname;}catch{return "";}})(),publishedDate:r.published_date||null,retrievedAt:new Date().toISOString(),excerpt:content.slice(0,900),department:department(title,url,txt),postName:postName(title),category:cat,vacancyCount:vacancyCount(txt),formStartDate:dates.formStart,lastDate:dates.lastDate,correctionDate:dates.correctionDate,examDate:dates.examDate,notificationDate:dates.notificationDate,extractedDates:Object.values(dates).filter(Boolean),dates,isOfficialDomain:officialDomain(url),evidenceStatus:officialDomain(url)?"Official domain — verify notice":"Discovery lead — verify official source",score:typeof r.score==="number"?r.score:null};
  });
  return NextResponse.json({query:searchQuery,checkedAt:new Date().toISOString(),notices,disclaimer:"Live search discovery. Extracted dates, department and vacancy counts need verification against the linked notice."},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Live search timed out or failed. Retry; results are not marked verified."},{status:502});}
}
