export type VerifiedCycle = {
  exam: string;
  board?: string;
  state?: string;
  notificationDate?: string;
  applicationStart?: string;
  applicationEnd?: string;
  examDate?: string;
  resultDate?: string;
  verified: boolean;
  sourceUrl?: string;
};
export type RecruitmentForecast = {
  exam: string;
  metric: "notification" | "applicationStart" | "applicationEnd" | "exam" | "result";
  predictedDate?: string;
  status: "green" | "yellow" | "orange" | "grey";
  confidence: number;
  historyCount: number;
  intervalMedianDays?: number;
  intervalVariation?: number;
  note: string;
  sourceCycles: string[];
};
const fields: Record<RecruitmentForecast["metric"],keyof VerifiedCycle> = {
  notification:"notificationDate",applicationStart:"applicationStart",applicationEnd:"applicationEnd",exam:"examDate",result:"resultDate"
};
function parseDay(value?:string):number|null {
  if(!value)return null;const d=new Date(value+"T00:00:00Z");return Number.isFinite(d.getTime())?d.getTime():null;
}
function median(values:number[]):number {
  const sorted=[...values].sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
export function forecastRecruitmentCycle(cycles:VerifiedCycle[],exam:string,metric:RecruitmentForecast["metric"]="notification"):RecruitmentForecast {
  const field=fields[metric];
  const valid=cycles.filter(c=>c.verified&&c.exam.toLowerCase()===exam.toLowerCase()&&parseDay(String(c[field]||""))!==null)
    .sort((a,b)=>parseDay(String(a[field]))!-parseDay(String(b[field]))!);
  if(valid.length<2)return {exam,metric,status:"grey",confidence:0,historyCount:valid.length,note:"Insufficient verified history for a forecast. Need at least two comparable cycles.",sourceCycles:valid.map(c=>c.sourceUrl||"source not recorded")};
  const dates=valid.map(c=>parseDay(String(c[field]))!);
  const intervals=dates.slice(1).map((d,i)=>(d-dates[i])/86400000);
  const med=median(intervals);
  const mad=median(intervals.map(x=>Math.abs(x-med)));
  const variation=med>0?mad/med:1;
  const next=new Date(dates[dates.length-1]+med*86400000);
  const predict=next.toISOString().slice(0,10);
  let status:RecruitmentForecast["status"]="orange";
  if(valid.length>=4&&variation<=0.08)status="green";
  else if(valid.length>=3&&variation<=0.2)status="yellow";
  const confidence=Math.min(0.9,Math.max(0.2,(valid.length/6)*(1-Math.min(variation,0.8))));
  return {exam,metric,predictedDate:predict,status,confidence,historyCount:valid.length,intervalMedianDays:Math.round(med),intervalVariation:Number(variation.toFixed(3)),note:"Statistical estimate from verified historical cycles only; not an official schedule. Validate against official calendar and latest notice.",sourceCycles:valid.map(c=>c.sourceUrl||"source not recorded")};
}
export function chunkRecruitmentText(text:string,maxChars=1400,overlap=180):string[] {
  const normalized=text.replace(/\s+/g," ").trim();if(!normalized)return [];
  const chunks:string[]=[];let start=0;
  while(start<normalized.length){let end=Math.min(normalized.length,start+maxChars);if(end<normalized.length){const cut=normalized.lastIndexOf(" ",end);if(cut>start+maxChars*0.65)end=cut;}chunks.push(normalized.slice(start,end).trim());if(end>=normalized.length)break;start=Math.max(start+1,end-overlap);}
  return chunks;
}
