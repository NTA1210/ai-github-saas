import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";

export const createMeeting = async ({
  projectId,
  meetingUrl,
  name,
}: {
  projectId: string;
  meetingUrl: string;
  name: string;
}) => {
  return await http.post("/meetings", {
    projectId,
    meetingUrl,
    name,
  });
};

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: createMeeting,
  });
};
