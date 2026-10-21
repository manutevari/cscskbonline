import { NextResponse } from "next/server";
import { getOfficialRecruitmentFeed } from "@/lib/recruitment-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1";
  try {
    const feed = await getOfficialRecruitmentFeed(refresh);
    return NextResponse.json(feed, {
      headers: { "Cache-Control": "no-store, max-age=0", "Vary": "Accept-Encoding" },
    });
  } catch {
    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      mode: "official-portal-link-scan",
      disclaimer: "Official portals could not be checked right now. Open the source portals directly to verify current notices.",
      sources: [],
      notices: [],
    }, { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
