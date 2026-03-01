import { Inngest } from "inngest";
import { prisma } from "@/lib/prisma";
import { supabaseStorage } from "@/lib/supabase";
import { processingMeeting } from "@/lib/assembly-ai";

// ─── Inngest Client ───────────────────────────────────────────────
export const inngest = new Inngest({ id: "ai-github-saas" });

// ─── Event Types ─────────────────────────────────────────────────
export type ProcessMeetingEvent = {
  name: "meeting/process";
  data: {
    meetingId: string;
  };
};

// ─── Background Function ──────────────────────────────────────────
export const processMeetingFn = inngest.createFunction(
  {
    id: "process-meeting",
    name: "Process Meeting Audio",
    retries: 3, // Retry 3 lần nếu lỗi
    timeouts: {
      finish: "2h", // Cho phép chạy tối đa 2 tiếng
    },
  },
  { event: "meeting/process" satisfies ProcessMeetingEvent["name"] },

  async ({ event, step }) => {
    const { meetingId } = event.data;

    // Step 1: Lấy meeting từ DB
    const meeting = await step.run("fetch-meeting", async () => {
      const m = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!m) throw new Error(`Meeting ${meetingId} not found`);
      return m;
    });

    // Step 2: Generate signed URL từ filePath để AssemblyAI truy cập được
    const signedUrl = await step.run("generate-signed-url", async () => {
      const { data, error } = await supabaseStorage.createSignedUrl(
        meeting.meetingUrl, // đang lưu filePath
        60 * 60, // expire sau 1 tiếng
      );
      if (error || !data?.signedUrl) {
        throw new Error("Cannot generate signed URL for audio file");
      }
      return data.signedUrl;
    });

    // Step 3: Gọi AssemblyAI để transcribe (có thể mất vài phút)
    const { summaries } = await step.run("transcribe-audio", async () => {
      return processingMeeting(signedUrl);
    });

    // Step 4: Lưu issues vào DB
    await step.run("save-issues", async () => {
      if (summaries.length > 0) {
        await prisma.issue.createMany({
          data: summaries.map((s) => ({
            meetingId,
            start: s.start,
            end: s.end,
            gist: s.gist,
            headline: s.headline,
            summary: s.summary,
          })),
        });
      }
    });

    // Step 5: Update meeting status → COMPLETED
    await step.run("update-meeting-status", async () => {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: "COMPLETED",
          name: summaries[0]?.headline ?? meeting.name,
        },
      });
    });

    console.log(`✅ Meeting ${meetingId} processed successfully`);
    return { success: true, meetingId, issuesCount: summaries.length };
  },
);
