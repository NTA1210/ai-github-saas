import { env } from "@/configs/env";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import dotenv from "dotenv";

dotenv.config();

export async function loadGithubRepo(githubUrl: string, githubToken?: string) {
  try {
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken || env.GITHUB_PAT,
      branch: "main",
      ignoreFiles: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"],
      recursive: true,
      unknown: "warn",
      maxConcurrency: 5,
    });

    const docs = await loader.load();
    console.log(docs);

    return docs;
  } catch (error: any) {
    console.log(error.message);
  }
}

loadGithubRepo("https://github.com/NTA1210/private-repo");
