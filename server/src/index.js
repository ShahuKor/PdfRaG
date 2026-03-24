import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import pdfsRouter from "./routes/pdfs.js";
import chatRouter from "./routes/chat.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/pdfs", pdfsRouter);
app.use("/api/pdfs", chatRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on port ${process.env.PORT || 8080}`);
});
