// lib/sendEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  return await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Welcome to the App! 🎉",
    html: `<h1>Hello, ${name}!</h1><p>Thanks for registering with us.</p>`,
  });
}
