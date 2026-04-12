export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    await sendWelcomeEmail({
      email,
      name: name || "there",
      intro: "You just signed in to your ViewSignal account.",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SIGN-IN EMAIL ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
