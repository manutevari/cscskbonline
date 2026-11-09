import { NextRequest } from "next/server";
export type MarketingRole = "owner_admin" | "marketing_manager" | "service_expert" | "operations_manager";
export type MarketingActor = { id: string; role: MarketingRole };
const CONFIG: Record<MarketingRole,{token:string;id:string}> = {
 owner_admin:{token:"CSCSKB_MARKETING_OWNER_TOKEN",id:"CSCSKB_MARKETING_OWNER_ID"},
 marketing_manager:{token:"CSCSKB_MARKETING_MANAGER_TOKEN",id:"CSCSKB_MARKETING_MANAGER_ID"},
 service_expert:{token:"CSCSKB_MARKETING_EXPERT_TOKEN",id:"CSCSKB_MARKETING_EXPERT_ID"},
 operations_manager:{token:"CSCSKB_MARKETING_OPERATIONS_TOKEN",id:"CSCSKB_MARKETING_OPERATIONS_ID"}
};
export function authenticateMarketingActor(request:NextRequest):MarketingActor|null {
 const header=request.headers.get("authorization")||"";
 if(!header.startsWith("Bearer "))return null;
 const supplied=header.slice(7); if(!supplied)return null;
 for(const role of Object.keys(CONFIG) as MarketingRole[]){
  const config=CONFIG[role], expected=process.env[config.token];
  if(expected && supplied.length===expected.length && supplied===expected)
   return {id:process.env[config.id]||role,role};
 }
 const legacy=process.env.CSCSKB_MARKETING_ADMIN_TOKEN;
 if(legacy && supplied.length===legacy.length && supplied===legacy)return {id:process.env.CSCSKB_MARKETING_OWNER_ID||"legacy_owner",role:"owner_admin"};
 return null;
}
export function unauthorized(){return Response.json({error:"Unauthorized: use a configured CSCSKB marketing role token."},{status:401});}
