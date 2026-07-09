// This file will export the NextAuth GET/POST handlers once we configure
// providers, session strategy, and callbacks on Day 5. Left empty on
// purpose — an incomplete NextAuth config would break the whole app,
// so we're not wiring this up until we actually build auth.
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  return NextResponse.json({ message: "NextAuth not configured yet — Day 5" });
}

export async function POST(): Promise<Response> {
  return NextResponse.json({ message: "NextAuth not configured yet — Day 5" });
}