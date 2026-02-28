import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const questions = await prisma.question.findMany({
      where: {
        projectId: id,
      },
      include: {
        user: true,
        fileReferences: {
          include: {
            sourceCodeEmbedding: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(questions);
  } catch (error) {
    console.error("[GetQuestions] GET error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
