import { useQuery } from "@tanstack/react-query";
import type { GetAllProjectsResponse } from "@/features/projects/types";
import http from "@/utils/http";

async function getAllProjects(): Promise<GetAllProjectsResponse> {
  return http.get<GetAllProjectsResponse>("/projects");
}

export function useGetAllProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjects,
  });
}
