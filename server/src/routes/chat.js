import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import OpenAI from "openai";
import { db } from "../db/index.js";
import { pdfs, messages } from "../db/schema.js";
import { retrieveChunksForPdf } from "../lib/qdrant.js";
import { requireAuth } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/pdfs/:id/chat
router.post("/:id/chat", requireAuth, async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    // 1. Verify PDF exists and belongs to the user
    const [pdf] = await db
      .select()
      .from(pdfs)
      .where(and(eq(pdfs.id, req.params.id), eq(pdfs.clerkUserId, req.userId)));

    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    if (pdf.status !== "ready") {
      return res.status(400).json({ error: "PDF is still being processed" });
    }

    // 2. Retrieve relevant chunks from Qdrant scoped to this PDF
    const chunks = await retrieveChunksForPdf(message, pdf.id);

    // 3. Load conversation history from DB
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.pdfId, pdf.id))
      .orderBy(asc(messages.createdAt));

    // 4. Build OpenAI messages array
    const systemPrompt = `You are a helpful assistant that answers questions based on the content of a PDF document.
Use the context below — extracted from the PDF — to answer the user's question accurately and concisely.
If the answer is not found in the context, say so honestly.

Context:
${chunks.map((c) => c.pageContent).join("\n\n---\n\n")}`;

    const openaiMessages = [
      { role: "system", content: systemPrompt },
      // Inject previous conversation turns
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    // 5. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
    });

    const assistantMessage = completion.choices[0].message.content;

    // 6. Persist both turns to DB
    await db.insert(messages).values([
      { pdfId: pdf.id, role: "user", content: message },
      { pdfId: pdf.id, role: "assistant", content: assistantMessage },
    ]);

    return res.json({ message: assistantMessage, sources: chunks });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/pdfs/:id/chat
// Returns the full chat history for a PDF
router.get("/:id/chat", requireAuth, async (req, res) => {
  try {
    const [pdf] = await db
      .select()
      .from(pdfs)
      .where(and(eq(pdfs.id, req.params.id), eq(pdfs.clerkUserId, req.userId)));

    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.pdfId, pdf.id))
      .orderBy(asc(messages.createdAt));

    return res.json({ messages: history });
  } catch (err) {
    console.error("Get history error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
