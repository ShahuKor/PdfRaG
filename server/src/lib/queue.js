import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

export const pdfQueue = new Queue("PDFQueue", {
  connection: {
    host: process.env.VALKEY_HOST || "localhost",
    port: Number(process.env.VALKEY_PORT) || 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
