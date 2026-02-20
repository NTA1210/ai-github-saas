import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/features/projects/schemas/create-project.schema";
import { getCommits } from "@/lib/github";
import http from "@/utils/http";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse & validate body (schema đã validate format GitHub URL)
  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { repoUrl, projectName } = parsed.data;

  // 3. Lookup user
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 4. Validate URL thật — gọi GitHub API trước khi tạo bất kỳ thứ gì trong DB
  // Nếu URL không tồn tại hoặc không có quyền truy cập → throw → không tạo project
  let commits: Awaited<ReturnType<typeof getCommits>>;
  try {
    commits = await getCommits(repoUrl);
  } catch {
    return NextResponse.json(
      {
        error: `Cannot access GitHub repository: ${repoUrl}. Make sure the URL is correct and the repository is public.`,
      },
      { status: 422 },
    );
  }

  // 5. Transaction: tạo project + commits cùng lúc, rollback nếu bất kỳ bước nào lỗi
  const project = await prisma.$transaction(async (tx) => {
    // Tạo project & relation
    const newProject = await tx.project.create({
      data: {
        name: projectName,
        githubUrl: repoUrl,
        users: {
          create: { userId: user.id },
        },
      },
    });

    // Lưu commits vào DB trong cùng transaction
    if (commits.length > 0) {
      await tx.commit.createMany({
        data: commits.map((commit) => ({
          projectId: newProject.id,
          commitHash: commit.commitHash,
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
          // summary sẽ được điền sau bởi background job (vì AI summary tốn thời gian)
          summary: null,
        })),
      });
    }

    return newProject;
  });

  // Fire & forget — PHẢI dùng absolute URL trên server
  // Node.js không resolve được relative URL → "Invalid URL" bị .catch() nuốt im lặng
  void http
    .post(
      `${req.nextUrl.origin}/api/projects/${project.id}/summarize`,
      undefined,
      {
        headers: { cookie: req.headers.get("cookie") ?? "" },
      },
    )
    .catch(() => {});

  return NextResponse.json({ project }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const projects = await prisma.project.findMany({
    where: {
      users: {
        some: { userId: user.id },
      },
    },
  });

  return NextResponse.json({ projects }, { status: 200 });
}
