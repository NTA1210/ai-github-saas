import { env } from "@/configs/env";
import { Document } from "@langchain/core/documents";
import { Pinecone } from "@pinecone-database/pinecone";
import { loadGithubRepo } from "./github-loader";
import openaiService from "./openai";
import { prisma } from "./prisma";
import { SourceCodeEmbedding } from "../../generated/prisma/client";

const SIMILARITY_THRESHOLD = 0.4;

export const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export const index = pinecone.index({ name: env.PINECONE_INDEX });

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs: Document[] = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  const vectors = allEmbeddings.map((embedding) => {
    const vectorId = `${projectId}-${embedding.branch}-${embedding.fileName}`;
    return {
      id: vectorId,
      values: embedding.embedding,
      metadata: {
        fileName: embedding.fileName,
        branch: embedding.branch,
      },
    };
  });

  await index.namespace(projectId).upsert({
    records: vectors,
    namespace: projectId,
  });

  await prisma.sourceCodeEmbedding.createMany({
    data: allEmbeddings.map((embedding) => ({
      id: `${projectId}-${embedding.branch}-${embedding.fileName}`,
      projectId,
      fileName: embedding.fileName,
      sourceCode: embedding.sourceCode,
      summary: embedding.summary,
      branch: embedding.branch,
    })),
  });
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await openaiService.summarizeCode(doc);
      const embedding = await openaiService.generateEmbedding(summary);
      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
        branch: doc.metadata.branch,
        repo: doc.metadata.repository,
      };
    }),
  );
};

export const getAskQuestionContext = async (
  question: string,
  projectId: string,
  topK: number = 5,
  { branch, fileName }: { branch?: string; fileName?: string } = {},
) => {
  const questionEmbedding = await openaiService.generateEmbedding(question);
  console.log("questionEmbedding: ", questionEmbedding);

  // Chỉ thêm filter khi có giá trị, tránh Pinecone lọc sai
  const filter: Record<string, string> = {};
  if (branch) filter.branch = branch;
  if (fileName) filter.fileName = fileName;

  const response = await index.namespace(projectId).query({
    vector: questionEmbedding,
    topK,
    ...(Object.keys(filter).length > 0 && { filter }),
    includeValues: false,
    includeMetadata: true,
  });

  console.log("RESPONSE: ", response.matches);

  const matches = response.matches.filter((match) => {
    if (!match.score) return false;
    return match.score >= SIMILARITY_THRESHOLD;
  });
  if (matches.length === 0) {
    return {
      context: "",
      sourceCodeEmbeddings: [],
    };
  }

  const sourceCodeEmbeddings = await prisma.sourceCodeEmbedding.findMany({
    where: {
      id: {
        in: matches.map((match) => match.id),
      },
    },
  });

  const context = retrieveContext(sourceCodeEmbeddings);

  return {
    context,
    sourceCodeEmbeddings,
  };
};

const retrieveContext = (sourceCodeEmbeddings: SourceCodeEmbedding[]) => {
  if (sourceCodeEmbeddings.length === 0) {
    return "";
  }

  return sourceCodeEmbeddings
    .map((sourceCode) => {
      return `source: ${sourceCode.fileName}\n content: ${sourceCode.sourceCode} \n summary: ${sourceCode.summary}`;
    })
    .join("\n");
};
