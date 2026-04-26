import nodemailer from "nodemailer";

export const sendCredentialsEmail = async (to, email, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      // user: "patelljyoti5@gmail.com",
      // pass: "toebwfqzgntkrxlj",
    },
  });

  await transporter.sendMail({
    from: "patelljyoti5@gmail.com",
    to,
    subject: "Your LegalEase Account",
    text: `
Email: ${email}
Password: ${password}

Login: http://localhost:5173
    `,
  });
};
export const sendDeadlineEmail = async (to, docTitle, deadline) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      // user: "patelljyoti5@gmail.com",
      // pass: "toebwfqzgntkrxlj",
    },
  });

  await transporter.sendMail({
    from: "patelljyoti5@gmail.com",
    to,
    subject: "⚠️ Deadline Reminder",
    text: `
Document :  ${docTitle}
Deadline :  ${deadline}

Please, review your document.
    `,
  });
};
