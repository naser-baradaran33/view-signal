import { resend } from "@/lib/resend";

export async function GET() {
  const result = await resend.emails.send({
    from: "ViewSignal <onboarding@resend.dev>",
    to: "naser.baradaran33@gmail.com",
    subject: "Test Email",
    html: "<p>This is a test email from Resend.</p>",
  });

  return Response.json(result);
}
