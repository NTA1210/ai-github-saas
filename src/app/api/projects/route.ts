import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/features/projects/schemas/create-project.schema";

export async function POST(req: NextRequest) {
  // 1. Auth check — Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse & validate body
  const body = await req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { repoUrl, projectName, githubToken } = parsed.data;

  // 3. Lookup internal user by Clerk externalId
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 4. Create project + relation atomically
  const project = await prisma.project.create({
    data: {
      name: projectName,
      githubUrl: repoUrl,
      users: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });

  return NextResponse.json({ projects }, { status: 200 });
}
