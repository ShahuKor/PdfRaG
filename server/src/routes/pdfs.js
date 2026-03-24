import { Router } from "express";
import multer from "multer";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { pdfs } from "../db/schema.js";
import { uploadToS3, deleteFromS3 } from "../lib/s3.js";
import { pdfQueue } from "../lib/queue.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Use memory storage — we upload the buffer directly to S3, no local disk needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, file);
  },
});

// POST /api/pdfs/upload
router.post("/upload", requireAuth, upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF file provided" });

    const s3Key = `pdfs/${req.userId}/${Date.now()}-${file.originalname}`;

    // 1. Upload to S3
    await uploadToS3(s3Key, file.buffer, "application/pdf");

    // 2. Save metadata to NeonDB
    const [newPdf] = await db
      .insert(pdfs)
      .values({
        clerkUserId: req.userId,
        filename: file.originalname,
        s3Key,
        status: "processing",
      })
      .returning();

    // 3. Push embedding job to BullMQ
    await pdfQueue.add("embed-pdf", {
      pdfId: newPdf.id,
      s3Key,
      filename: file.originalname,
    });

    return res.status(201).json({ pdf: newPdf });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/pdfs
router.get("/", requireAuth, async (req, res) => {
  try {
    const userPdfs = await db
      .select()
      .from(pdfs)
      .where(eq(pdfs.clerkUserId, req.userId))
      .orderBy(pdfs.createdAt);

    return res.json({ pdfs: userPdfs });
  } catch (err) {
    console.error("List PDFs error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/pdfs/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const [pdf] = await db
      .select()
      .from(pdfs)
      .where(and(eq(pdfs.id, req.params.id), eq(pdfs.clerkUserId, req.userId)));

    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    return res.json({ pdf });
  } catch (err) {
    console.error("Get PDF error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pdfs/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const [pdf] = await db
      .select()
      .from(pdfs)
      .where(and(eq(pdfs.id, req.params.id), eq(pdfs.clerkUserId, req.userId)));

    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    // Delete from S3
    await deleteFromS3(pdf.s3Key);

    // Delete from DB (messages cascade via FK)
    await db.delete(pdfs).where(eq(pdfs.id, pdf.id));

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete PDF error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
