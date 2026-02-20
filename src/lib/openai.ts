import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAiService {
  summarizeCommit = async (diff: string): Promise<string> => {
    const response = await ai.chat.completions.create({
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
