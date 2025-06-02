// utils/sendEmail.ts
import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async ({ to, subject, text }: MailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: `"Dakesh Support" <${process.env.USER}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
