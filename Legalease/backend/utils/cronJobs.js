import cron from "node-cron";
import Document from "../models/Document.js";
import nodemailer from "nodemailer";
import { sendDeadlineEmail } from "../utils/emailService.js";

export const startDeadlineChecker = () => {
  cron.schedule("* * * * *", async () => {
    console.log(" Checking deadlines...");

    const today = new Date();

    const docs = await Document.find().populate("uploadedBy");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "patelljyoti5@gmail.com", //admin email
        pass: "toebwfqzgntkrxlj",
      },
    });

    for (let doc of docs) {
      for (let d of doc.deadlines) {
        let deadline;
        // Try normal parsing first
        deadline = new Date(d);

        // If failed → clean text
        if (isNaN(deadline)) {
          const match = d.match(/\b\w+\s\d{1,2},\s\d{4}\b/);

          if (match) {
            let baseDate = new Date(match[0]);
            //  check for "week"
            if (d.toLowerCase().includes("week")) {
              baseDate.setDate(baseDate.getDate() + 7);
            }

            //  check for "month"
            if (d.toLowerCase().includes("month")) {
              baseDate.setMonth(baseDate.getMonth() + 1);
            }

            deadline = baseDate;
          }
        }
        // Final safety
        if (isNaN(deadline)) continue;

        const diff = (deadline - today) / (1000 * 60 * 60 * 24);

        if (diff >= 0 && diff <= 7) {
          try {
            if (!doc.notified) {
              await sendDeadlineEmail(doc.uploadedBy.email, doc.title, d);
              doc.notified = true;
              await doc.save();
            }
          } catch (error) {
            console.log("Email failed.");
          }
        }
      }
    }
  });
};
