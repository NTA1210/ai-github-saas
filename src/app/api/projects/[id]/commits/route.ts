import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        commits: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project.commits);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch project commits" },
      { status: 500 },
    );
  }
}
