export const dynamic = "force-dynamic"; // جلوگیری از اجرای route در زمان build

import { Resend } from "resend";

export async function GET() {
  // ساخت Resend فقط داخل handler
  const resend = new Resend(process.env.RESEND_API_KEY!);

  try {
    const result = await resend.emails.send({
      from: "ViewSignal <onboarding@resend.dev>",
      to: "naser.baradaran33@gmail.com",
      subject: "Test Email",
      html: "<p>This is a test email from Resend.</p>",
    });

    return Response.json({ success: true, result });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
