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
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are an expert software engineer. Summarize the following git diff for a developer audience.

RULES:
- Focus on WHAT changed and WHY it matters (impact), not HOW the code works line-by-line.
- Each bullet point must start with an action verb (e.g. Add, Remove, Fix, Refactor, Update, Move).
- Mention specific file names, function names, or component names when relevant.
- Group related changes into a single bullet instead of listing every file separately.
- If the diff only contains whitespace, comments, or formatting changes, output: "Style/formatting changes only."
- If the diff is empty or unreadable, output: "No meaningful changes detected."
- Maximum 5 bullet points. Each bullet: 1 concise sentence, max 20 words.

OUTPUT FORMAT (plain text, no Markdown headers):
• [action verb] [what changed] in [file/component] — [impact if non-obvious]

Git diff:
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
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are an expert software engineer. Your task is to write a dense, keyword-rich summary of a source code file.
This summary will be converted into a vector embedding and used for semantic code search (RAG). The quality of the summary directly impacts search accuracy.

File path: ${doc.metadata.source}

\`\`\`
${code}
\`\`\`

Write a summary that covers ALL of the following:
1. **Purpose**: What is the single responsibility of this file?
2. **Exports**: List all exported functions, classes, types, constants, and hooks by name.
3. **Key logic**: Describe the main algorithms, data transformations, or business rules implemented.
4. **Dependencies**: Mention notable imports (libraries, internal modules) this file relies on.
5. **Side effects**: Does it connect to a database, call an API, modify global state, or emit events?

RULES:
- Be specific: use the exact function/class/variable names as they appear in the code.
- Do NOT use generic descriptions like "handles logic" or "manages state" without specifying what logic or state.
- Do NOT describe code line-by-line.
- Keep the summary between 100–200 words.
- Write in plain English, no Markdown formatting.`,
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
