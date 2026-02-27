import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { SourceCodeEmbedding } from "../../../../../../../generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      question,
      answer,
      fileReferences,
      projectId,
    }: {
      question: string;
      answer: string;
      fileReferences: SourceCodeEmbedding[];
      projectId: string;
    } = await request.json();

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const savedQuestion = await prisma.question.create({
      data: {
        question,
        answer,
        projectId,
        userId: user.id, // Dùng User.id thật, không phải clerkId
        fileReferences: {
          create:
            fileReferences?.map((ref) => ({
              sourceCodeEmbeddingId: ref.id,
            })) ?? [],
        },
      },
      include: {
        fileReferences: {
          include: {
            sourceCodeEmbedding: true,
          },
        },
      },
    });

    return Response.json(savedQuestion);
  } catch (error) {
    console.error("[SaveQuestion] POST error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
