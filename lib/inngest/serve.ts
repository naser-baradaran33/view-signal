import { serve } from "inngest/next";
import { inngest } from "./client";
import { sendSignUpEmail, sendDailyNewsSummary } from "./functions";

export const handler = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary],
});
