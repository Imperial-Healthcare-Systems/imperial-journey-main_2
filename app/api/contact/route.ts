import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #ececec;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7a7a;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:13px 0;border-bottom:1px solid #ececec;font-size:15px;color:#0d0d0d;">${value}</td>
    </tr>`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, type, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const s = {
    name:    escHtml(name.trim()),
    email:   escHtml(email.trim()),
    phone:   escHtml((phone   || "").trim()) || "—",
    type:    escHtml((type    || "").trim()) || "—",
    subject: escHtml((subject || "").trim()) || "—",
    message: escHtml(message.trim()).replace(/\n/g, "<br/>"),
  };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ececec;border-radius:8px;overflow:hidden;">

      <div style="background:#0d0d0d;padding:32px 40px;">
        <p style="color:#c8a45a;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 8px;">
          Imperial Journeys
        </p>
        <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:600;">New Trip Enquiry</h1>
      </div>

      <div style="padding:36px 40px;background:#ffffff;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Name",      s.name)}
          ${row("Email",     `<a href="mailto:${s.email}" style="color:#c8a45a;text-decoration:none;">${s.email}</a>`)}
          ${row("Phone",     s.phone)}
          ${row("Trip Type", s.type)}
          ${row("Subject",   s.subject)}
        </table>

        <div style="margin-top:28px;">
          <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#7a7a7a;margin:0 0 14px;">
            Message
          </p>
          <div style="background:#fafafa;border-left:3px solid #c8a45a;padding:20px 24px;font-size:15px;color:#0d0d0d;line-height:1.75;border-radius:0 4px 4px 0;">
            ${s.message}
          </div>
        </div>
      </div>

      <div style="padding:20px 40px;background:#fafafa;border-top:1px solid #ececec;text-align:center;">
        <p style="font-size:12px;color:#7a7a7a;margin:0;">
          Hit <strong style="color:#0d0d0d;">Reply</strong> to respond directly to
          <strong style="color:#0d0d0d;">${s.name}</strong> at ${s.email}
        </p>
      </div>

    </div>`;

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from:    `"Imperial Journeys" <${process.env.SMTP_USER}>`,
      to:      "info@imperialtechinnovations.com",
      replyTo: email.trim(),
      subject: `New Enquiry: ${subject?.trim() || name.trim()}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact/route] mail error:", err);
    return NextResponse.json(
      { error: "Failed to send. Please try again or WhatsApp us." },
      { status: 500 },
    );
  }
}
