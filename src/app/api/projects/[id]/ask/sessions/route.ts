import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const sessions = new Map<
  string,
  { question: string; projectId: string }
>();

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { question, projectId } = await req.json();

  if (!question || !projectId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sessionId = randomUUID();

  sessions.set(sessionId, { question, projectId });

  return NextResponse.json({ sessionId });
}
