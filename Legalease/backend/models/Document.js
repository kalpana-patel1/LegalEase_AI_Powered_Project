import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ADD THIS BLOCK
    category: {
      type: String,
      enum: [
        "NDA",
        "Agreement",
        "Contract",
        "Lease",
        "Affidavit",
        "Property",
        "Tender",
        "Court",
        "Legal Document",
        "Other",
      ],
      default: "Other",
    },
    risk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    //  FIXED SUMMARY STRUCTURE
    summary: {
      caseTitle: String,
      summary: String, //  IMPORTANT (this was missing)

      parties: {
        petitioner: String,
        respondent: String,
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    deadlines: [String],
    displayDeadlines: [
      {
        title: String,
        description: String,
        date: String,
      },
    ],
    notified: {
      type: Boolean,
      default: false,
    },
    riskyClauses: [String],
    suggestion: String,
  },
  { timestamps: true },
);

export default mongoose.model("Document", documentSchema);
