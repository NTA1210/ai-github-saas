import OpenAI from "openai";
import dotenv from "dotenv";
import { env } from "@/configs/env";
import { Document } from "@langchain/core/documents";

dotenv.config();

class OpenAiService {
  private readonly ai: OpenAI;

  constructor() {
    this.ai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  summarizeCommit = async (diff: string): Promise<string> => {
    const response = await this.ai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an experienced software engineer. Your task is to generate a concise and meaningful summary of a git diff.

Important notes about git diff format:

For each modified file, the diff contains metadata lines such as:

diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js

This indicates that the file \`lib/index.js\` was modified in this commit.

Within each diff block:
- Lines starting with "+" represent added code.
- Lines starting with "-" represent deleted code.
- Lines without "+" or "-" are context lines and should not be treated as changes.

Your goal:
- Summarize the actual changes introduced by the commit.
- Focus only on meaningful code changes.
- Ignore metadata and context lines.
- Do NOT repeat or reference this instruction text in your output.

Formatting requirements:
- Provide short, clear bullet points.
- Each bullet should describe a logical change.
- Mention file names in brackets when helpful.
- Keep the summary concise.

Now, summarize the following git diff:

${diff}`,
        },
      ],
    });

    return response.choices[0].message.content ?? "";
  };

  summarizeCode = async (doc: Document): Promise<string> => {
    const code = doc.pageContent.slice(0, 10000);
    const response = await this.ai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer onboarding a junior developer to a new codebase.

Explain the purpose of the file: ${doc.metadata.source}

Here is the file content:
---
${code} 
---

Provide:
1. The main responsibility of this file
2. How it fits into the overall system (if inferable)
3. Key functions/classes and what they do (high-level only)

Keep the explanation concise (max 120 words).
Do not describe code line-by-line.`,
        },
      ],
    });

    return response.choices[0].message.content ?? "";
  };

  generateEmbedding = async (summary: string) => {
    const response = await this.ai.embeddings.create({
      model: "text-embedding-3-small",
      input: summary,
    });

    return response.data[0].embedding;
  };

  generateAskQuestionStreaming = async (question: string, context: string) => {
    const stream = await this.ai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are an expert AI software engineer analyzing a specific codebase.
Your goal is to provide clear, well-structured, and detailed answers about THIS project ONLY using Markdown.

STRICT CONSTRAINTS:
1. ONLY use the information provided in the CONTEXT below.
2. If the CONTEXT is empty, irrelevant, or does not contain enough information to answer the question, you MUST say exactly: "I don't know based on the provided project files."
3. DO NOT use your general knowledge to answer questions about how this project works if it's not in the context.
4. Ensure your response is detailed enough for a junior developer to follow but stay strictly within the project's scope.

FORMATTING RULES:
1. ALWAYS use headings (###) for major sections.
2. Use bullet points or numbered lists for steps.
3. Use double newlines (\\n\\n) between paragraphs and sections.
4. Use code blocks with language tags for all code snippets.

CONTEXT FROM PROJECT FILES:
${context}

QUESTION ABOUT THE PROJECT:
${question}

Based ONLY on the context above, provide your detailed answer:`,
        },
      ],
    });

    return stream;
  };
}

export default new OpenAiService();

// ---- TEST ----
// (async () => {
//   const result = await summarizeCommit(`diff --git a/server.js b/server.js
// index 8702420..611a665 100644
// --- a/server.js
// +++ b/server.js
// @@ -1,6 +1,6 @@
//  const express = require("express");
//  const appRoute = require("./src/routes");
// -const response = require("./src/middlewares/response.middleware");
// -const errorHandler = require("./src/middlewares/errorHandler.middleware");
// +const response = require("./src/middlewares/responseFormat");
// +const errorHandler = require("./src/middlewares/exceptionHandler");
// `);
//   console.log(result);
// })();

// (async () => {
//   const openaiService = new OpenAiService();
//   const result = await openaiService.generateEmbedding("Hello world");
//   console.log(result);
// })();
