import http from "@/utils/http";
import { useQuery } from "@tanstack/react-query";
import { Issue, Meeting } from "../../../../generated/prisma/client";

export type MeetingWithIssues = Meeting & { issues: Issue[] };

export async function getMeetings(projectId: string) {
  return await http.get<MeetingWithIssues[]>(`/projects/${projectId}/meetings`);
}

export function useGetMeetings(projectId: string) {
  return useQuery({
    queryKey: ["meetings", projectId],
    queryFn: () => getMeetings(projectId),
    enabled: !!projectId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,

    // ✅ Chỉ polling khi có meeting đang PROCESSING
    // refetchInterval nhận function: trả về ms để poll, hoặc false để dừng
    refetchInterval: (query) => {
      const meetings = query.state.data;
      const hasProcessing = meetings?.some((m) => m.status === "PROCESSING");
      // Nếu có meeting đang xử lý → poll mỗi 4s, không thì dừng
      return hasProcessing ? 4000 : false;
    },
  });
}
