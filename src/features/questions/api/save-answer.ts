import http from "@/utils/http";
import { useMutation } from "@tanstack/react-query";
import { SaveAnswerParams, SavedQuestion } from "../types";

async function saveAnswer(params: SaveAnswerParams): Promise<SavedQuestion> {
  const response = await http.post<SavedQuestion>(
    `/projects/${params.projectId}/questions/save`,
    params,
  );

  return response;
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: saveAnswer,
  });
}

export default saveAnswer;
