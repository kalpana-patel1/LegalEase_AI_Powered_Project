import express from "express";
import multer from "multer";
import protect from "../middleware/authMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Document from "../models/Document.js";
import {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();
router.get("/my-documents", protect, getMyDocuments, async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user._id });

    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.delete("/:id", authMiddleware, deleteDocument);
router.get("/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- MULTER CONFIG ---------------- */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ---------------- UPLOAD ROUTE ---------------- */

router.post(
  "/upload",
  protect,
  authMiddleware,
  upload.single("file"),

  uploadDocument,
);

export default router;
