import { getAskQuestionContext } from "@/lib/pipecone";
import { NextRequest } from "next/server";
import openaiService from "@/lib/openai";
import { sessions } from "../sessions/route";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId || !sessions.has(sessionId)) {
      console.log("INVALID SESSION");

      return new Response("Invalid session", { status: 400 });
    }

    const { question, projectId } = sessions.get(sessionId)!;

    const { context, sourceCodeEmbeddings } = await getAskQuestionContext(
      question,
      projectId,
    );

    console.log("Context", context);
    console.log("Source code embeddings", sourceCodeEmbeddings);

    const stream = await openaiService.generateAskQuestionStreaming(
      context,
      question,
    );

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // send source code first
        controller.enqueue(
          encoder.encode(
            `event: sources\ndata: ${JSON.stringify(sourceCodeEmbeddings)}\n\n`,
          ),
        );

        // send streaming response
        for await (let chunk of stream) {
          const token = chunk.choices[0].delta.content;
          if (token) {
            controller.enqueue(
              encoder.encode(`event: token\ndata: ${token}\n\n`),
            );
          }
        }

        controller.enqueue(encoder.encode(`event: done\ndata: end\n\n`));

        controller.close();

        sessions.delete(sessionId);
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
