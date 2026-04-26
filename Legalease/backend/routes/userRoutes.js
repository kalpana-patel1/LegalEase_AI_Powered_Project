import express from "express";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Document from "../models/Document.js";

const router = express.Router();

// GET all lawyers (admin only)
router.get("/lawyers", protect, async (req, res) => {
  try {
    // Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const lawyers = await User.find({ role: "lawyer" }).select("-password");

    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a lawyer by id (admin only)
router.delete("/lawyers/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const id = req.params.id;
    const user = await User.findById(id);
    if (!user || user.role !== "lawyer") {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    // Remove user and optionally their documents
    await Document.deleteMany({ uploadedBy: user._id });
    await user.deleteOne();

    res.json({ message: "Lawyer deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET dashboard stats (admin only)
router.get("/stats", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const totalLawyers = await User.countDocuments({ role: "lawyer" });
    const totalDocuments = await Document.countDocuments();
    const highRisk = await Document.countDocuments({ riskLevel: "high" });
    const pending = await Document.countDocuments({ status: "pending" });

    // recent activity: last 5 document uploads with uploader name
    const recentDocs = await Document.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("uploadedBy", "name");

    const recentActivity = recentDocs.map((d) => ({
      title: d.title,
      uploadedBy: d.uploadedBy?.name || "Unknown",
      createdAt: d.createdAt,
    }));

    res.json({
      totalLawyers,
      totalDocuments,
      highRisk,
      pending,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
