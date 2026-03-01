import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId } = await req.json();

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 },
      );
    }

    // Kiểm tra meeting tồn tại
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // ✅ Gửi event cho Inngest - KHÔNG chờ, Inngest tự xử lý ở background
    await inngest.send({
      name: "meeting/process",
      data: { meetingId },
    });

    // Trả về 202 Accepted ngay lập tức
    return NextResponse.json(
      { message: "Meeting queued for processing" },
      { status: 202 },
    );
  } catch (error) {
    console.error("Error queuing meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
