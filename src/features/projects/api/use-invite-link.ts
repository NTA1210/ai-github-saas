import http from "@/utils/http";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InviteLink } from "../../../../generated/prisma/client";

async function getInviteLink(projectId: string) {
  return await http.get<InviteLink>(`/projects/${projectId}/invite-links`);
}

export function useGetInviteLink(projectId: string) {
  return useQuery({
    queryKey: ["invite-link", projectId],
    queryFn: () => getInviteLink(projectId),
  });
}
