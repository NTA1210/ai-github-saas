import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommits } from "@/lib/github";
import openAiService from "@/lib/openai";
import http from "@/utils/http";

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
        // Lấy diff từ GitHub
        const diff = await http.get<string>(
          `${project.githubUrl}/commit/${commit.commitHash}.diff`,
          { headers: { Accept: "application/vnd.github.v3.diff" } },
        );

        // Gọi AI
        const summary = await openAiService.summarizeCommit(diff);

        // Update DB
        await prisma.commit.update({
          where: { id: commit.id },
          data: { summary },
        });

        return { commitHash: commit.commitHash, status: "success" };
      } catch {
        return { commitHash: commit.commitHash, status: "failed" };
      }
    }),
  );

  const succeeded = results.filter(
    (r) => r.status === "fulfilled" && r.value.status === "success",
  ).length;

  return NextResponse.json({
    message: `Summarized ${succeeded}/${unsummarizedCommits.length} commits`,
    count: succeeded,
  });
}
