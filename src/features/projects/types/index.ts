import type { Commit, Project } from "../../../../generated/prisma/client";
import type { CreateProjectInput } from "../schemas/create-project.schema";

export type { CreateProjectInput };

export type CreateProjectResponse = {
  project: Project;
};

export type GetAllProjectsResponse = {
  projects: Project[];
};

export type TCommit = Commit;
