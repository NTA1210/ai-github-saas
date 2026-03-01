import { serve } from "inngest/next";
import { inngest, processMeetingFn } from "@/lib/inngest";

// Route này Inngest Cloud / Dev Server sẽ gọi để execute functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMeetingFn],
});
