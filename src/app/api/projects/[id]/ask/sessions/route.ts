import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 phút

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { question, projectId } = body;

    if (!question?.trim() || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: question and projectId" },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const session = await prisma.askSession.create({
      data: {
        userId,
        projectId,
        question: question.trim(),
        expiresAt,
      },
    });

    // Dọn dẹp các session đã hết hạn (best-effort, không block response)
    prisma.askSession
      .deleteMany({
        where: { expiresAt: { lt: new Date() } },
      })
      .catch((err) =>
        console.error("[AskSession] Failed to cleanup expired sessions:", err),
      );

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("[AskSession] POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
