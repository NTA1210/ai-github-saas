import http from "@/utils/http";
import { User } from "../../../../generated/prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getTeamMembers(id: string) {
  const { users } = await http.get<{ users: User[] }>(
    `/projects/${id}/team-members`,
  );
  return users;
}

export function useGetTeamMembers(id: string) {
  return useQuery({
    queryKey: ["team-members", id],
    queryFn: () => getTeamMembers(id),
  });
}
