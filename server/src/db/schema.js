import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const pdfs = pgTable("pdfs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull(),
  filename: text("filename").notNull(),
  s3Key: text("s3_key").notNull(),
  status: text("status").notNull().default("processing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  pdfId: uuid("pdf_id")
    .notNull()
    .references(() => pdfs.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
