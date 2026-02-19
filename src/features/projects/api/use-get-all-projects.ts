import { useQuery } from "@tanstack/react-query";
import type { GetAllProjectsResponse } from "@/features/projects/types";
import http from "@/utils/http";

async function getAllProjects(): Promise<GetAllProjectsResponse> {
  return http.get<GetAllProjectsResponse>("/projects");
}

export function useGetAllProjects() {
  return useQuery({
    queryKey: ["projects"], // phải match với queryKey trong layout prefetchQuery
    queryFn: getAllProjects,
    // Với hydration, data đã có sẵn từ server nên staleTime cao để tránh refetch ngay lập tức
    staleTime: 60 * 1000, // 1 phút
  });
}
