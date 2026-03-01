/**
 * APPROACH 2: Inngest - API Routes
 *
 * Cần 2 routes:
 * 1. /api/inngest         → Inngest handler (bắt buộc, Inngest gọi vào đây)
 * 2. /api/issues          → Chỉ send event, trả về ngay
 */

// ═══════════════════════════════════════════════════════
// File 1: src/app/api/inngest/route.ts
// Route này Inngest Cloud sẽ tự động gọi để execute functions
// ═══════════════════════════════════════════════════════

import { serve } from "inngest/next";
import { inngest, processMeetingFn } from "@/lib/inngest";

// Đăng ký tất cả Inngest functions ở đây
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMeetingFn,
    // thêm functions khác ở đây...
  ],
});

// ═══════════════════════════════════════════════════════
// File 2: src/app/api/issues/route.ts
// Chỉ cần send event rồi trả về ngay, Inngest tự xử lý
// ═══════════════════════════════════════════════════════

import { inngest as inngestClient } from "@/lib/inngest";
import { NextRequest, NextResponse } from "next/server";

export async function POST_INNGEST(req: NextRequest) {
  const { meetingId } = await req.json();

  // ✅ Gửi event cho Inngest - KHÔNG await processing
  await inngestClient.send({
    name: "meeting/process",
    data: { meetingId },
  });

  // Trả về ngay lập tức
  return NextResponse.json(
    { message: "Meeting queued for processing" },
    { status: 202 },
  );
}
