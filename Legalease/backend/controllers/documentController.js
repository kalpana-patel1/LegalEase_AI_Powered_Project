import Document from "../models/Document.js";
import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import axios from "axios";
import FormData from "form-data";
import { sendDeadlineEmail } from "../utils/emailService.js";

//  Detect risk (fallback if API fails)
const detectRisk = (text) => {
  text = text.toLowerCase();

  if (
    text.includes("penalty") ||
    text.includes("liability") ||
    text.includes("termination")
  )
    return "High";
  if (text.includes("agreement") || text.includes("contract")) return "Medium";
  return "Low";
};

//  Extract dates
const extractDeadlines = (text) => {
  const regex = /\b\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4}\b/g;
  return text.match(regex) || [];
};

//  Title
const generateTitle = (text) => {
  const firstLine = text.split("\n").find((line) => line.trim().length > 10);

  if (!firstLine) return "Legal Document";

  return firstLine.slice(0, 60);
};

//  Category
const classifyDocument = (text) => {
  text = text.toLowerCase();

  if (text.includes("non disclosure") || text.includes("nda")) return "NDA";

  if (text.includes("agreement") || text.includes("contract"))
    return "Agreement";

  if (text.includes("lease") || text.includes("rent")) return "Lease";

  if (text.includes("affidavit")) return "Affidavit";

  if (text.includes("property") || text.includes("sale deed"))
    return "Property";
  if (
    text.includes("tender") ||
    text.includes("vendor") ||
    text.includes("quotation")
  )
    return "Tender";

  if (
    text.includes("court") ||
    text.includes("bail") ||
    text.includes("petition") ||
    text.includes("case") ||
    text.includes("judge") ||
    text.includes("seized") ||
    text.includes("customs") ||
    text.includes("accused")
  )
    return "Court";

  return "Other"; // instead of Legal Document
};

//  MAIN CONTROLLER

export const uploadDocument = async (req, res) => {
  const io = req.app.get("io");

  try {
    if (!req.user)
      return res.status(401).json({ error: "User not authenticated" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    //  VALIDATION
    if (!req.file.originalname || req.file.originalname.trim() === "") {
      return res.status(400).json({ error: "File name is required" });
    }
    const userId = req.user._id.toString();
    const filePath = req.file.path;

    //  STEP 1
    io.to(userId).emit("progress", {
      percent: 20,
      message: "File uploaded...",
    });

    //  STEP 2 (READ FILE)
    io.to(userId).emit("progress", {
      percent: 40,
      message: "Reading document...",
    });

    let text = "";

    if (req.file.mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      text = data.text;
    } else {
      text = fs.readFileSync(filePath, "utf-8");
    }

    if (!text || text.length < 100) {
      return res.status(400).json({ error: "Text extraction failed" });
    }

    //  CLEAN TEXT
    const cleanText = text
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    //  STEP 3 (AI)
    io.to(userId).emit("progress", {
      percent: 70,
      message: "Analyzing document with AI...",
    });

    let aiData = {};

    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      const response = await axios.post(
        "http://127.0.0.1:8000/summarize",
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 120000,
        },
      );
      console.log("FASTAPI RESPONSE:", response.data);

      aiData = response.data;
      if (response.data.error) {
        return res.status(400).json({
          error: response.data.error,
        });
      }
      console.log("AI DATA:", aiData);
    } catch (err) {
      console.error("AI Error:", err.message);
      if (err.code === "ECONNRESET") {
        console.log(" Connection reset - retry or fallback");
      }
      // fallback (very important)
      aiData = {
        title: "Legal Document",
        summary: "AI summary could not be generated.",
        risk: detectRisk(cleanText),
        deadlines: [],
        riskyClauses: [],
      };
    }

    //  DEADLINE PRIORITY LOGIC (NEW)

    const today = new Date();

    // Normalize AI deadlines safely
    const normalizedDeadlines = (aiData.deadlines || []).map((d) => {
      // if AI already gives structured object
      if (typeof d === "object") {
        return {
          title: d.title || aiData.title || "Document",
          description: d.description || "",
          date: d.date || "",
        };
      }

      // if it's string
      return {
        title: aiData.title || "Document",
        description: d,
        date: d, // fallback (may or may not work)
      };
    });

    const processedDeadlines = normalizedDeadlines
      .map((d) => {
        // const parsedDate = new Date(d.date);

        // if (isNaN(parsedDate)) return null; //  skip invalid
        let parsedDate = new Date(d.date);

        //  fallback: try extracting real date inside string
        if (isNaN(parsedDate)) {
          const match = d.date.match(/\b\w+\s\d{1,2},\s\d{4}\b/);
          // example: "1 April 2026"

          if (match) {
            parsedDate = new Date(match[0]);
          }
        }

        if (isNaN(parsedDate)) return null;

        return {
          ...d,
          dateObj: parsedDate,
        };
      })
      .filter((d) => d !== null);
    // future deadlines only
    const futureDeadlines = processedDeadlines
      .filter((d) => !isNaN(d.dateObj) && d.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);

    // within 7 days
    const deadlinesWithin7Days = futureDeadlines.filter((d) => {
      const diffDays = (d.dateObj - today) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    // final display logic
    let displayDeadlines = [];

    if (deadlinesWithin7Days.length > 0) {
      displayDeadlines = deadlinesWithin7Days;
    } else if (futureDeadlines.length > 0) {
      displayDeadlines = [futureDeadlines[0]];
    }

    //  SAVE
    const doc = await Document.create({
      title: aiData.title || "Legal Document",
      fileUrl: filePath,

      //  USE FASTAPI CATEGORY FIRST
      category: aiData.category || classifyDocument(cleanText),
      risk: aiData.risk || detectRisk(cleanText),

      summary: {
        caseTitle: "Legal Document",
        summary: aiData.summary || "No summary generated",
        parties: {
          petitioner: aiData.parties?.petitioner || "Not specified",
          respondent: aiData.parties?.respondent || "Not specified",
        },
      },

      deadlines: aiData.deadlines || [],
      displayDeadlines: displayDeadlines, //  ADD THIS
      riskyClauses: aiData.riskyClauses || [],
      suggestion: "Review document carefully",
      uploadedBy: userId,
    });

    //  SEND EMAIL ALERTS (NEW)

    if (deadlinesWithin7Days.length > 0) {
      console.log("User email:", req.user.email);
      for (const d of deadlinesWithin7Days) {
        console.log("Sending for:", d);
        await sendDeadlineEmail(req.user.email, d.title, d.date);
      }
    }

    //  STEP 4
    io.to(userId).emit("progress", {
      percent: 100,
      message: "Completed!",
    });

    return res.status(200).json({ message: "Success", doc });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

//////////delete option/////////////

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // ensure only owner deletes
    if (doc.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await doc.deleteOne();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER DOCUMENTS (WITH FIX)

export const getMyDocuments = async (req, res) => {
  console.log("GET DOCS HIT");
  try {
    const docs = await Document.find({
      uploadedBy: req.user._id,
    });

    for (let doc of docs) {
      if (doc.category === "Other" || !doc.category) {
        const text = doc.summary?.summary || "";

        const newCategory = classifyDocument(text);

        if (newCategory !== doc.category) {
          doc.category = newCategory;
          await doc.save();
        }
      }
    }

    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
