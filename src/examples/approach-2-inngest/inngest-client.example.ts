/**
 * APPROACH 2: Inngest - Background Job
 *
 * File: src/lib/inngest.ts (EXAMPLE)
 *
 * Setup Inngest client và định nghĩa background function.
 */

import { Inngest } from "inngest";
import { prisma } from "@/lib/prisma";
import { supabaseStorage } from "@/lib/supabase";
import { processingMeeting } from "@/lib/assembly-ai";

// 1. Khởi tạo Inngest client
export const inngest = new Inngest({ id: "ai-github-saas" });

// 2. Định nghĩa type cho event
type ProcessMeetingEvent = {
  name: "meeting/process";
  data: {
    meetingId: string;
  };
};

// 3. Định nghĩa background function
export const processMeetingFn = inngest.createFunction(
  {
    id: "process-meeting",
    name: "Process Meeting",
    // ✅ Retry tự động 3 lần nếu lỗi
    retries: 3,
    // ✅ Timeout 2 giờ - đủ cho AssemblyAI xử lý file dài
    timeout: "2h",
  },
  // Trigger khi nhận event "meeting/process"
  { event: "meeting/process" },

  // Handler - chạy ở background trên Inngest cloud
  async ({ event, step }) => {
    const { meetingId } = event.data;

    // step.run() = mỗi step được retry độc lập nếu lỗi
    const meeting = await step.run("fetch-meeting", async () => {
      return prisma.meeting.findUnique({ where: { id: meetingId } });
    });

    if (!meeting) throw new Error(`Meeting ${meetingId} not found`);

    // Generate signed URL
    const signedUrl = await step.run("generate-signed-url", async () => {
      const { data, error } = await supabaseStorage.createSignedUrl(
        meeting.meetingUrl,
        60 * 60,
      );
      if (error || !data?.signedUrl)
        throw new Error("Cannot generate signed URL");
      return data.signedUrl;
    });

    // Gọi AssemblyAI (step này có thể mất vài phút)
    const { summaries } = await step.run("transcribe-meeting", async () => {
      return processingMeeting(signedUrl);
    });

    // Lưu issues
    await step.run("save-issues", async () => {
      await prisma.issue.createMany({
        data: summaries.map((s) => ({ meetingId, ...s })),
      });
    });

    // Update status
    await step.run("update-meeting-status", async () => {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: "COMPLETED",
          name: summaries[0]?.headline ?? meeting.name,
        },
      });
    });

    return { success: true, meetingId };
  },
);
