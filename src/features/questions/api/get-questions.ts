import http from "@/utils/http";
import { GetQuestionsResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

async function getQuestions(projectId: string): Promise<GetQuestionsResponse> {
  // console.log(projectId);

  const response = await http.get<GetQuestionsResponse>(
    `/projects/${projectId}/questions`,
  );
  console.log(response);

  return response;
}

export const useGetQuestions = (projectId?: string) => {
  return useQuery({
    queryKey: ["questions", projectId],
    queryFn: () => getQuestions(projectId!),
    enabled: !!projectId,
  });
};
