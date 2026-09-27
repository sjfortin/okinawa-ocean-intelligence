import { NextResponse } from "next/server";
import { siteSeeds } from "@/data/site-seeds";

export function GET() {
  return NextResponse.json({ data: siteSeeds, source: "milestone-1-seed-catalog" });
}

