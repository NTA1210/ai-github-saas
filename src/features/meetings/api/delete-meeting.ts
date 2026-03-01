import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

async function deleteMeeting(id: string) {
  const response = await http.del(`/meetings/${id}`);
  return response;
}

export const useDeleteMeeting = () => {
  return useMutation({
    mutationFn: deleteMeeting,
  });
};
