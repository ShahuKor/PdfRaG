import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Queue } from "bullmq";
import OpenAI from "openai";
dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const queue = new Queue("PDFQueue", {
  connection: {
    host: "localhost",
    port: 6379,
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
  const userquery = req.query.message;
  const retriever = vectorStore.asRetriever({
    k: 2,
  });
  const output = await retriever.invoke(userquery);

  const SYSTEM_PROMPT = `You are a helpful AI assistant who anwers the user query based on the available context from the pdf file. 
  Context : ${JSON.stringify(output)}`;

  const chatResult = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userquery,
      },
    ],
  });
  return res.json({
    message: chatResult.output[0].content[0].text,
    docs: output,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Backend is running on port ${process.env.PORT}`);
});
