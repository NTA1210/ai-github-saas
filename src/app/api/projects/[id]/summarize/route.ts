import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import openAiService from "@/lib/openai";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  // Lấy tất cả commit chưa có summary
  const unsummarizedCommits = await prisma.commit.findMany({
    where: { projectId, summary: null },
  });

  if (unsummarizedCommits.length === 0) {
    return NextResponse.json({
      message: "All commits already summarized",
      count: 0,
    });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Summarize từng commit và update DB
  const results = await Promise.allSettled(
    unsummarizedCommits.map(async (commit) => {
      try {
        // Lấy diff từ GitHub — dùng native fetch, KHÔNG dùng http.ts
        // http.ts có baseURL "/api" → http.get("https://github.com/...") sẽ fail
        const diffRes = await fetch(
          `${project.githubUrl}/commit/${commit.commitHash}.diff`,
          { headers: { Accept: "application/vnd.github.v3.diff" } },
        );

        if (!diffRes.ok) {
          throw new Error(
            `GitHub diff fetch failed: ${diffRes.status} ${diffRes.statusText}`,
          );
        }

        const diff = await diffRes.text();

        // Gọi AI
        const summary = await openAiService.summarizeCommit(diff);

        // Update DB
        await prisma.commit.update({
          where: { id: commit.id },
          data: { summary },
        });

        // update isFirstTimeSetup to false after summarizing
        await prisma.project.update({
          where: { id: projectId },
          data: { isFirstTimeSetup: false },
        });

        return { commitHash: commit.commitHash, status: "success" as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `[summarize] FAILED commit ${commit.commitHash.slice(0, 7)}:`,
          message,
        );
        return {
          commitHash: commit.commitHash,
          status: "failed" as const,
          error: message,
        };
      }
    }),
  );

  const succeeded = results.filter(
    (r) => r.status === "fulfilled" && r.value.status === "success",
  ).length;

  const failures = results
    .filter((r) => r.status === "fulfilled" && r.value.status === "failed")
    .map(
      (r) =>
        (
          r as PromiseFulfilledResult<{
            commitHash: string;
            status: "failed";
            error: string;
          }>
        ).value,
    );

  if (failures.length > 0) {
    console.error(`[summarize] ${failures.length} commits failed:`, failures);
  }

  return NextResponse.json({
    message: `Summarized ${succeeded}/${unsummarizedCommits.length} commits`,
    count: succeeded,
    failures: failures.length > 0 ? failures : undefined,
  });
}
