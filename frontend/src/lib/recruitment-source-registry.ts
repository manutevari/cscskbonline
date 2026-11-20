export const INDIA_STATES_UTS = [
"Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
"Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
] as const;

export const CENTRAL_RECRUITMENT_DOMAINS = [
"ssc.gov.in","upsc.gov.in","rrbapply.gov.in","indianrailways.gov.in","ibps.in","sbi.co.in","rbi.org.in","joinindianarmy.nic.in","joinindiannavy.gov.in","agnipathvayu.cdac.in","employmentnews.gov.in","ncs.gov.in"
];

export const STATE_PORTAL_DOMAINS: Record<string,string[]> = {
"Uttar Pradesh":["up.gov.in","uppsc.up.nic.in","upsssc.gov.in","uppbpb.gov.in","upessc.up.gov.in","updeled.gov.in"],
"Bihar":["bihar.gov.in","bpsc.bih.nic.in","csbc.bih.nic.in","bssc.bihar.gov.in"],
"Rajasthan":["rajasthan.gov.in","rpsc.rajasthan.gov.in","rssb.rajasthan.gov.in"],
"Madhya Pradesh":["mp.gov.in","mppsc.mp.gov.in","esb.mp.gov.in"],
"Maharashtra":["maharashtra.gov.in","mpsc.gov.in"],
"West Bengal":["wb.gov.in","psc.wb.gov.in","wbpolice.gov.in"],
"Delhi":["delhi.gov.in","dsssb.delhi.gov.in","delhi police.gov.in"],
"Haryana":["haryana.gov.in","hssc.gov.in","hpsc.gov.in"],
"Punjab":["punjab.gov.in","ppsc.gov.in"],
"Gujarat":["gujarat.gov.in","gpsc.gujarat.gov.in","ojas.gujarat.gov.in"],
"Uttarakhand":["uk.gov.in","psc.uk.gov.in","sssc.uk.gov.in"],
"Jharkhand":["jharkhand.gov.in","jpsc.gov.in","jssc.nic.in"],
"Chhattisgarh":["cgstate.gov.in","psc.cg.gov.in","vyapam.cgstate.gov.in"],
"Odisha":["odisha.gov.in","opsc.gov.in","osssc.gov.in"],
"Assam":["assam.gov.in","apsc.nic.in","slprbassam.in"],
"Karnataka":["karnataka.gov.in","kpsc.kar.nic.in"],
"Kerala":["kerala.gov.in","keralapsc.gov.in"],
"Tamil Nadu":["tn.gov.in","tnpsc.gov.in","trb.tn.gov.in"],
"Andhra Pradesh":["ap.gov.in","psc.ap.gov.in"],
"Telangana":["telangana.gov.in","tspsc.gov.in"],
"Himachal Pradesh":["himachal.gov.in","hppsc.hp.gov.in"],
"Goa":["goa.gov.in","gpsc.goa.gov.in"],
"Arunachal Pradesh":["arunachalpradesh.gov.in","appsc.gov.in"],
"Manipur":["manipur.gov.in","mpscmanipur.gov.in"],
"Meghalaya":["meghalaya.gov.in","mpsc.nic.in"],
"Mizoram":["mizoram.gov.in","mpsc.mizoram.gov.in"],
"Nagaland":["nagaland.gov.in","npsc.nagaland.gov.in"],
"Tripura":["tripura.gov.in","tpsc.tripura.gov.in"],
"Sikkim":["sikkim.gov.in","spsc.sikkim.gov.in"],
"Andaman and Nicobar Islands":["andaman.gov.in"],
"Chandigarh":["chandigarh.gov.in"],
"Dadra and Nagar Haveli and Daman and Diu":["daman.nic.in","dnh.gov.in"],
"Jammu and Kashmir":["jk.gov.in","jkpsc.nic.in","ssbjk.org"],
"Ladakh":["ladakh.gov.in"],
"Lakshadweep":["lakshadweep.gov.in"],
"Puducherry":["py.gov.in","psc.py.gov.in"]
};

export function domainsForState(state: string, category = "All Categories"): string[] {
  if (!state || state === "All States" || state === "All India" || state === "Central") return CENTRAL_RECRUITMENT_DOMAINS;
  return STATE_PORTAL_DOMAINS[state] || [];
}
