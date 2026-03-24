import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { eq } from "drizzle-orm";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import dotenv from "dotenv";

import { db } from "./src/db/index.js";
import { pdfs } from "./src/db/schema.js";
import { downloadFromS3 } from "./src/lib/s3.js";

dotenv.config();

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY,
});

const worker = new Worker(
  "PDFQueue",
  async (job) => {
    const { pdfId, s3Key, filename } = job.data;
    console.log(`[worker] Processing job ${job.id} for PDF ${pdfId}`);

    let tmpPath = null;

    try {
      // 1. Download PDF buffer from S3
      console.log(`[worker] Downloading from S3: ${s3Key}`);
      const buffer = await downloadFromS3(s3Key);

      // 2. Write buffer to a temp file (PDFLoader needs a file path)
      tmpPath = join(tmpdir(), `${pdfId}.pdf`);
      await writeFile(tmpPath, buffer);

      // 3. Load and parse the PDF
      const loader = new PDFLoader(tmpPath);
      const rawDocs = await loader.load();

      // 4. Chunk the documents
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await splitter.splitDocuments(rawDocs);

      // 5. Attach pdfId to every chunk's metadata so we can filter later
      const taggedDocs = docs.map((doc) => ({
        ...doc,
        metadata: { ...doc.metadata, pdfId, filename },
      }));

      // 6. Embed and store in Qdrant
      console.log(
        `[worker] Embedding ${taggedDocs.length} chunks for ${pdfId}`,
      );
      await QdrantVectorStore.fromDocuments(taggedDocs, embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: "pdf-rag",
      });

      // 7. Mark PDF as ready in NeonDB
      await db.update(pdfs).set({ status: "ready" }).where(eq(pdfs.id, pdfId));

      console.log(`[worker] Done — PDF ${pdfId} is ready`);
    } catch (err) {
      console.error(`[worker] Failed for PDF ${pdfId}:`, err);

      // Mark as failed so the frontend can surface the error
      await db.update(pdfs).set({ status: "failed" }).where(eq(pdfs.id, pdfId));

      throw err; // Re-throw so BullMQ records the failure and retries
    } finally {
      // 8. Clean up the temp file
      if (tmpPath) {
        await unlink(tmpPath).catch(() => {});
      }
    }
  },
  {
    connection: {
      host: process.env.VALKEY_HOST || "localhost",
      port: Number(process.env.VALKEY_PORT) || 6379,
    },
    concurrency: 2, // process up to 2 PDFs at once
  },
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

console.log("[worker] Listening for PDF embedding jobs...");
