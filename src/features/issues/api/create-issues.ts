import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

async function createIssues(meetingId: string) {
  return await http.post<{ message: string }>("/issues", { meetingId });
}

export const useCreateIssues = () => {
  return useMutation({
    mutationFn: createIssues,
  });
};
