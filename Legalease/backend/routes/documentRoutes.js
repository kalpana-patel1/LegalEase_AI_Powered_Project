// import express from "express";
// import multer from "multer";
// import Document from "../models/Document.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { uploadDocument } from "../controllers/documentController.js";

// const router = express.Router();

// /* ------------------ MULTER CONFIG ------------------ */

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// /* ------------------ UPLOAD ROUTE ------------------ */

// router.post(
//   "/upload",
//   authMiddleware,
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       const newDoc = await Document.create({
//         title: req.body.title,
//         fileUrl: req.file.path,
//         uploadedBy: req.user.id,
//       });

//       res.json({
//         message: "Document uploaded",
//         document: newDoc,
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },
// );

// export default router;

import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadDocument } from "../controllers/documentController.js";

const router = express.Router();

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

router.post("/upload", authMiddleware, upload.single("file"), uploadDocument);

export default router;
