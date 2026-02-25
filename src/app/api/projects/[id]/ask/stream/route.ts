import { getAskQuestionContext } from "@/lib/pipecone";
import { NextRequest } from "next/server";
import openaiService from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return new Response("Missing sessionId", { status: 400 });
    }

    // Lấy session từ DB và validate
    const session = await prisma.askSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return new Response("Invalid or expired session", { status: 400 });
    }

    // Kiểm tra session có hết hạn chưa
    if (session.expiresAt < new Date()) {
      await prisma.askSession
        .delete({ where: { id: sessionId } })
        .catch(() => null);
      return new Response("Session expired", { status: 410 });
    }

    // Bảo mật: chỉ cho phép owner của session stream
    if (session.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    const { question, projectId } = session;

    // Xóa session ngay sau khi lấy xong để tránh replay attack
    await prisma.askSession
      .delete({ where: { id: sessionId } })
      .catch(() => null);

    const { context, sourceCodeEmbeddings } = await getAskQuestionContext(
      question,
      projectId,
    );

    const aiStream = await openaiService.generateAskQuestionStreaming(
      question,
      context,
    );

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: string) => {
          // SSE data can have multiple 'data:' lines which are joined by \n
          const lines = data.split("\n");
          let sseMessage = `event: ${event}\n`;
          for (const line of lines) {
            sseMessage += `data: ${line}\n`;
          }
          sseMessage += "\n";
          controller.enqueue(encoder.encode(sseMessage));
        };

        try {
          // Gửi sources trước
          send("sources", JSON.stringify(sourceCodeEmbeddings));

          // Stream token từ AI
          for await (const chunk of aiStream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
              send("token", token);
            }
          }

          send("done", "end");
        } catch (streamError) {
          console.error("[AskStream] Stream error:", streamError);
          send("error", "Stream interrupted");
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        // Tắt buffering ở Nginx/proxy (quan trọng cho production)
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[AskStream] GET error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
