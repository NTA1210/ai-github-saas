import { z } from "zod";

const githubUrlSchema = z.url("Invalid URL").refine(
  (url) => {
    try {
      const { hostname, pathname } = new URL(url);
      const [, owner, repo] = pathname.split("/");
      return hostname === "github.com" && !!owner && !!repo;
    } catch {
      return false;
    }
  },
  {
    message:
      "Must be a valid GitHub repository URL (e.g. https://github.com/owner/repo)",
  },
);

export const createProjectSchema = z.object({
  repoUrl: githubUrlSchema,
  projectName: z
    .string()
    .min(3, "Project name must be at least 3 characters long"),
  githubToken: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
