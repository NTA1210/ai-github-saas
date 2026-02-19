import { z } from "zod";

export const createProjectSchema = z.object({
  repoUrl: z.url("Invalid URL"),
  projectName: z
    .string()
    .min(3, "Project name must be at least 3 characters long"),
  githubToken: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
