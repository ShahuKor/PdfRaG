import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Queue } from "bullmq";

dotenv.config();

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const queue = new Queue("PDFQueue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "pdf-rag",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const app = express();

app.use(cors());

app.post("/pdf/upload", upload.single("pdf"), function (req, res, next) {
  const file = req.file;
  queue.add(
    "file-upload",
    JSON.stringify({
      filename: file.originalname,
      destination: file.destination,
      path: file.path,
    }),
  );
});

app.get("/chat", async (req, res) => {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: "pdf-rag",
    },
  );
  const userquery = "What is the deposit paid amount";
  const retriever = vectorStore.asRetriever({
    k: 2,
  });
  const output = await retriever.invoke(userquery);
  return res.json({ output });
});

app.listen(process.env.PORT, () => {
  console.log(`Backend is running on port ${process.env.PORT}`);
});
