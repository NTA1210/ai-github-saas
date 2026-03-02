import http from "@/utils/http";
import { Project } from "../../../../generated/prisma/client";
import { useQuery } from "@tanstack/react-query";

export async function getProjectById(id: string) {
  const res = await http.get<{ project: Project }>(`/projects/${id}`);
  return res;
}

export function useGetProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id),
  });
}
