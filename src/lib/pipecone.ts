import { env } from "@/configs/env";
import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export const index = (namespace: string) =>
  pinecone.index({ name: env.PINECONE_INDEX }).namespace(namespace);
