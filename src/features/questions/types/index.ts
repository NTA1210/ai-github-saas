import {
  Question,
  QuestionReference,
  SourceCodeEmbedding,
  User,
} from "../../../../generated/prisma/client";

export interface SaveAnswerParams {
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

export type GetQuestionsResponse = (SavedQuestion & { user: User })[];
