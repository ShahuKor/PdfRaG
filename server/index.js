import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
dotenv.config();

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
  return res.json({ status: 200, message: "File Uploaded Sucessfully" });
});

app.listen(process.env.PORT, () => {
  console.log(`Backend is running on port ${process.env.PORT}`);
});
