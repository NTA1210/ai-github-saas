/**
 * APPROACH 1: AssemblyAI Webhook Handler
 *
 * File: src/app/api/assembly-webhook/route.ts (EXAMPLE)
 *
 * AssemblyAI sẽ POST vào đây khi transcript xong.
 * Đây là nơi lưu issues và update meeting status.
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // AssemblyAI truyền meetingId qua header (ta set ở bước submit)
    const meetingId = req.headers.get("x-meeting-id");

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meeting ID" },
        { status: 400 },
      );
    }

    // Body từ AssemblyAI webhook
    const body = await req.json();

    console.log("AssemblyAI webhook received:", body.status);

    // Chỉ xử lý khi transcript đã hoàn thành
    if (body.status !== "completed") {
      return NextResponse.json(
        { message: "Not completed yet" },
        { status: 200 },
      );
    }

    // Lấy data từ webhook payload
    const chapters = body.chapters ?? [];

    if (chapters.length === 0) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: "COMPLETED" },
      });
      return NextResponse.json({ message: "No chapters found" });
    }

    function msToTime(ms: number): string {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    // Lưu issues vào DB
    await prisma.issue.createMany({
      data: chapters.map(
        (chapter: {
          start: number;
          end: number;
          gist: string;
          headline: string;
          summary: string;
        }) => ({
          meetingId,
          start: msToTime(chapter.start),
          end: msToTime(chapter.end),
          gist: chapter.gist,
          headline: chapter.headline,
          summary: chapter.summary,
        }),
      ),
    });

    // Update meeting status
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: chapters[0]?.headline ?? "Meeting",
      },
    });

    console.log(`✅ Meeting ${meetingId} processed successfully`);

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
