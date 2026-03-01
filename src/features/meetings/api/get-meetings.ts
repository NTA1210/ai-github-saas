import http from "@/utils/http";
import { useQuery } from "@tanstack/react-query";
import { Issue, Meeting } from "../../../../generated/prisma/client";

export async function getMeetings(projectId: string) {
  return await http.get<(Meeting & { issues: Issue[] })[]>(
    `/projects/${projectId}/meetings`,
  );
}

export function useGetMeetings(projectId: string) {
  return useQuery({
    queryKey: ["meetings", projectId],
    queryFn: () => getMeetings(projectId),
    refetchInterval: 4000, // 4 seconds
    refetchIntervalInBackground: true, // refetch when window is in background
    refetchOnWindowFocus: true, // refetch when window regains focus
    refetchOnMount: true, // refetch when component mounts
    refetchOnReconnect: true, // refetch when network reconnects
    retry: 1, // retry only once
  });
}
