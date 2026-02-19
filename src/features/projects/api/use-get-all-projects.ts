import { useQuery } from "@tanstack/react-query";
import type { CreateProjectResponse } from "@/features/projects/types";
import http from "@/utils/http";

async function getAllProjects(): Promise<CreateProjectResponse[]> {
  return http.get<CreateProjectResponse[]>("/projects");
}

export function useGetAllProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjects,
  });
}
