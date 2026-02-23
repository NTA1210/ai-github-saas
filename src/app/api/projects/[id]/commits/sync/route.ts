import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommits } from "@/lib/github";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/projects/[id]/commits/sync
 * Kiểm tra GitHub có commit mới không → insert vào DB nếu có
 * Trả về số lượng commit mới được thêm
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, githubUrl: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // 1. Lấy danh sách commit hash đang có trong DB
  const existingHashes = await prisma.commit
    .findMany({
      where: { projectId },
      select: { commitHash: true },
    })
    .then((rows) => new Set(rows.map((r) => r.commitHash)));

  // 2. Fetch commits mới nhất từ GitHub
  const latestCommits = await getCommits(project.githubUrl);

  // 3. Lọc ra những commit chưa có trong DB
  const newCommits = latestCommits.filter(
    (c) => !existingHashes.has(c.commitHash),
  );

  if (newCommits.length === 0) {
    return NextResponse.json({ message: "Already up to date", count: 0 });
  }

  // 4. Insert commit mới vào DB
  await prisma.commit.createMany({
    data: newCommits.map((commit) => ({
      projectId,
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitAuthorName: commit.commitAuthorName,
      commitAuthorAvatar: commit.commitAuthorAvatar,
      commitDate: commit.commitDate,
      summary: null,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    message: `Found ${newCommits.length} new commit(s)`,
    count: newCommits.length,
  });
}
