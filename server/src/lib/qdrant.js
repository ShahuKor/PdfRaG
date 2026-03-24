import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();

const COLLECTION_NAME = "pdf-rag";

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getVectorStore() {
  return QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: COLLECTION_NAME,
  });
}

export async function retrieveChunksForPdf(query, pdfId, k = 4) {
  const vectorStore = await getVectorStore();
  const retriever = vectorStore.asRetriever({
    k,
    filter: {
      must: [{ key: "metadata.pdfId", match: { value: pdfId } }],
    },
  });
  return retriever.invoke(query);
}
