export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendWelcomeEmail({
      email: "naser.baradaran33@gmail.com", // همونی که باهاش تو Resend ثبت‌نام/verify کردی
      name: "Naser Test",
      intro: "This is a test email from ViewSignal.",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("TEST EMAIL ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
