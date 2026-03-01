import http from "@/utils/http";
import { GetMeetingDetailResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export async function getMeetingDetail(id: string) {
  const response = await http.get<GetMeetingDetailResponse>(`/meetings/${id}`);
  return response;
}

export function useGetMeetingDetail(id: string) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => getMeetingDetail(id),
  });
}
