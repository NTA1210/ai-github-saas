import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import http from "@/utils/http";
import openAiService from "./openai";
import { env } from "@/configs/env";

dotenv.config();

const octokit = new Octokit({
  auth: env.GITHUB_PAT,
});

type CommitData = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommits = async (githubUrl: string): Promise<CommitData[]> => {
  const { pathname } = new URL(githubUrl);
  const [, owner, repo] = pathname.split("/");

  if (!owner || !repo) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }

  const { data } = await octokit.rest.repos.listCommits({ owner, repo });

  return data.map((commit) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message || "",
    commitAuthorName: commit.commit.author?.name || "",
    commitAuthorAvatar: commit.author?.avatar_url || "",
    commitDate: commit.commit.author?.date || "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);
  const commits = await getCommits(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commits);

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>
      summarizeCommit(githubUrl, commit.commitHash),
    ),
  );

  const summaries = summaryResponses.map((response) =>
    response.status === "fulfilled" ? response.value : "",
  );

  return prisma.commit.createMany({
    data: unprocessedCommits.map((commit, index) => ({
      projectId,
      commitHash: commit.commitHash,
      commitMessage: commit.commitMessage,
      commitAuthorName: commit.commitAuthorName,
      commitAuthorAvatar: commit.commitAuthorAvatar,
      commitDate: commit.commitDate,
      summary: summaries[index],
    })),
  });
};

async function fetchProjectGithubUrl(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");
  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commits: CommitData[],
) {
  const processed = await prisma.commit.findMany({ where: { projectId } });
  return commits.filter(
    (c) => !processed.some((p) => p.commitHash === c.commitHash),
  );
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
  const diff = await http.get<string>(
    `${githubUrl}/commit/${commitHash}.diff`,
    {
      headers: { Accept: "application/vnd.github.v3.diff" },
    },
  );
  return openAiService.summarizeCommit(diff);
}

async function loadGithubRepo() {
  const { data } = await octokit.repos.getContent({
    owner: "nta1210",
    repo: "ai-github-saas",
    path: "src/app",
  });

  // console.log(data?.map((data) => data.name));
}

loadGithubRepo();
