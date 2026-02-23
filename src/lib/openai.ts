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
