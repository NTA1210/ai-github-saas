import { useMutation } from "@tanstack/react-query";
import type {
  CreateProjectInput,
  CreateProjectResponse,
} from "@/features/projects/types";
import http from "@/utils/http";

async function createProject(
  data: CreateProjectInput,
): Promise<CreateProjectResponse> {
  return http.post<CreateProjectResponse>("/projects", data);
}

export function useCreateProject() {
  return useMutation({
    mutationFn: createProject,
  });
}
