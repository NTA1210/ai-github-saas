import { Document } from "@langchain/core/documents";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import dotenv from "dotenv";

dotenv.config();

type GithubRepoLoaderOptions = {
  branch?: string;
  ignoreFiles?: string[];
  recursive?: boolean;
  unknown?: "warn" | "error";
  maxConcurrency?: number;
};

export async function loadGithubRepo(
  githubUrl: string,
  githubToken?: string,
  {
    branch = "main",
    ignoreFiles = [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      ".env",
      ".env.local",
      ".env.example",
      ".env.test",
      ".env.dev",
      ".env.prod",
    ],
    recursive = true,
    unknown = "warn",
    maxConcurrency = 5,
  }: GithubRepoLoaderOptions = {},
): Promise<Document[]> {
  try {
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken,
      branch,
      ignoreFiles,
      recursive,
      unknown,
      maxConcurrency,
    });

    const docs = await loader.load();
    console.log(docs);

    return docs;
  } catch (error: any) {
    console.log(error.message);
    return [];
  }
}

// loadGithubRepo(
//   "https://github.com/FOASDN/BE_FOA",
// );
