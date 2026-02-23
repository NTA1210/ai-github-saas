import { env } from "@/configs/env";
import { Document } from "@langchain/core/documents";
import { Pinecone } from "@pinecone-database/pinecone";
import { loadGithubRepo } from "./github-loader";
import openaiService from "./openai";
import { prisma } from "./prisma";

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
