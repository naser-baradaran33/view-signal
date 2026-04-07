export const dynamic = "force-dynamic";

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";

// فانکشن‌هایی که خودت ساختی
import { sendSignUpEmail, sendDailyNewsSummary } from "@/lib/inngest/functions";

export const { GET, POST } = serve({
  client: inngest,
  functions: [
    sendSignUpEmail,
    sendDailyNewsSummary,
  ],
});
