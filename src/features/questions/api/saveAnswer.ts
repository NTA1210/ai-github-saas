import http from "@/utils/http";
import {
  Question,
  QuestionReference,
  SourceCodeEmbedding,
} from "../../../../generated/prisma/client";
import { useMutation } from "@tanstack/react-query";

interface SaveAnswerParams {
  projectId: string;
  question: string;
  answer: string;
  fileReferences: SourceCodeEmbedding[];
}

// Kiểu trả về từ API: Question kèm theo các QuestionReference đã được populate
export type SavedQuestion = Question & {
  fileReferences: (QuestionReference & {
    sourceCodeEmbedding: SourceCodeEmbedding;
  })[];
};

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
