import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

async function archiveProject(projectId: string) {
  const project = await http.put(`/projects/${projectId}/archive`);

  return project;
}

export const useArchiveProject = () => {
  return useMutation({
    mutationFn: archiveProject,
  });
};
