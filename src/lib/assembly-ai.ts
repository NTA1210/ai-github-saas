// Install the assemblyai package by executing the command "npm install assemblyai"

import { env } from "@/configs/env";
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: env.ASSEMBLY_AI_API_KEY,
});

// const audioFile = "./local_file.mp3";
const audioFile = "https://assembly.ai/wildfires.mp3";

function msToTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export const processingMeeting = async (meetingUrl: string) => {
  const transcript = await client.transcripts.transcribe({
    audio: meetingUrl,
    language_detection: true,
    speech_models: ["universal-3-pro", "universal-2"],
    auto_chapters: true,
  });

  const summaries =
    transcript.chapters?.map((chapter) => {
      return {
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        summary: chapter.summary,
        headline: chapter.headline,
        gist: chapter.gist,
      };
    }) || [];

  if (!transcript.text) {
    throw new Error("Transcript is empty");
  }

  return {
    transcript: transcript.text,
    summaries,
  };
};

processingMeeting(audioFile).then((res) => {
  console.log(res);
});
