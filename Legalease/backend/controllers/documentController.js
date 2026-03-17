import Document from "../models/Document.js";
export const uploadDocument = async (req, res) => {
  const io = req.app.get("io");

  try {
    // 🔎 Safety checks
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user._id.toString();
    const fileName = req.file.originalname.toLowerCase();
    // STEP 1
    io.to(userId).emit("progress", {
      percent: 20,
      message: "File uploaded...",
    });

    await new Promise((r) => setTimeout(r, 1000));

    // STEP 2
    io.to(userId).emit("progress", {
      percent: 40,
      message: "Reading document...",
    });

    await new Promise((r) => setTimeout(r, 1500));

    // STEP 3
    io.to(userId).emit("progress", {
      percent: 70,
      message: "Analyzing content...",
    });

    await new Promise((r) => setTimeout(r, 2000));

    // STEP 4
    io.to(userId).emit("progress", {
      percent: 100,
      message: "Completed!",
    });

    return res.status(200).json({
      message: "Document processed successfully",
      filePath: req.file.path,
    });
  } catch (error) {
    console.error("FULL UPLOAD ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};
