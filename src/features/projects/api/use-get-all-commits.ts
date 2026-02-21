import http from "@/utils/http";
import { useQuery } from "@tanstack/react-query";
import { TCommit } from "../types";

async function getAllCommits(projectId: string) {
  return http.get<TCommit[]>(`/projects/${projectId}/commits`);
}

export function useGetAllCommits(projectId: string) {
  return useQuery<TCommit[], Error>({
    queryKey: ["commits", projectId],
    queryFn: () => getAllCommits(projectId),
  });
}
