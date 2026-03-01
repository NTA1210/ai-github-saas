/**
 * APPROACH 1: AssemblyAI Webhook
 *
 * File: src/app/api/issues/route.ts (EXAMPLE - không dùng thực tế)
 *
 * Thay vì chờ AssemblyAI xong mới trả về,
 * ta submit audio + webhook_url rồi trả về 202 ngay.
 * AssemblyAI sẽ tự gọi lại webhook khi xong.
 */

import { prisma } from "@/lib/prisma";
import { supabaseStorage } from "@/lib/supabase";
import { AssemblyAI } from "assemblyai";
import { env } from "@/configs/env";
import { NextRequest, NextResponse } from "next/server";

const client = new AssemblyAI({ apiKey: env.ASSEMBLY_AI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { meetingId } = await req.json();

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Generate signed URL từ filePath
    const { data: signedData } = await supabaseStorage.createSignedUrl(
      meeting.meetingUrl,
      60 * 60,
    );

    if (!signedData?.signedUrl) {
      return NextResponse.json(
        { error: "Cannot generate audio URL" },
        { status: 500 },
      );
    }

    // ✅ SUBMIT audio cho AssemblyAI kèm webhook_url
    // AssemblyAI sẽ gọi webhook sau khi xong, không cần await
    await client.transcripts.submit({
      audio: signedData.signedUrl,
      language_detection: true,
      auto_chapters: true,
      // Webhook URL - AssemblyAI sẽ POST vào đây khi transcript xong
      webhook_url: `${env.NEXT_PUBLIC_APP_URL}/api/assembly-webhook`,
      // Truyền meetingId qua webhook_auth_header_name để webhook biết meeting nào
      webhook_auth_header_name: "x-meeting-id",
      webhook_auth_header_value: meetingId,
    });

    // ✅ Trả về 202 NGAY LẬP TỨC - không cần chờ AssemblyAI xong
    return NextResponse.json(
      { message: "Meeting submitted for processing" },
      { status: 202 },
    );
  } catch (error) {
    console.error("Error submitting meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
