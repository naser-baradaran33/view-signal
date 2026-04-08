import { inngest } from "./client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/email";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";

/* -----------------------------------------------------------
   SIGN UP EMAIL
----------------------------------------------------------- */

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
    triggers: [{ event: "app/user.created" }],
  },
  async ({ event, step }) => {
    const {
      email,
      name,
      country,
      investmentGoals,
      riskTolerance,
      preferredIndustry,
    } = event.data;

    const userProfile = `
- Country: ${country}
- Investment goals: ${investmentGoals}
- Risk tolerance: ${riskTolerance}
- Preferred industry: ${preferredIndustry}
`;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const introText =
      (part && "text" in part ? part.text : null) ||
      "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.";

    await step.run("send-welcome-email", async () => {
      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return { success: true };
  }
);

/* -----------------------------------------------------------
   DAILY NEWS SUMMARY
----------------------------------------------------------- */

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    triggers: [{ cron: "0 12 * * *" }],
  },
  async ({ step }) => {
    console.log("🟡 DAILY NEWS SUMMARY START");

    const users = await step.run("get-all-users", async () => {
      const list = await getAllUsersForNewsEmail();
      console.log("👥 USERS:", list?.length || 0);
      return list || [];
    });

    if (!users.length) return { success: false, message: "No users found" };

    const perUser = await step.run("collect-news", async () => {
      return await Promise.all(
        users.map(async (user) => {
          try {
            const symbols = await getWatchlistSymbolsByEmail(user.email);
            let articles = await getNews(symbols);
            if (!articles?.length) articles = await getNews();
            return { user, articles: (articles || []).slice(0, 6) };
          } catch (err) {
            console.error("NEWS ERROR:", user.email, err);
            return { user, articles: [] };
          }
        })
      );
    });

    const summaries = await step.run("summaries", async () => {
      return await Promise.all(
        perUser.map(async ({ user, articles }) => {
          try {
            if (!articles.length) {
              return {
                user,
                newsContent:
                  "No significant news found for your watchlist today.",
              };
            }

            const articlesText = articles
              .map(
                (a, i) =>
                  `${i + 1}. ${a.headline || a.title || ""} - ${
                    a.summary || ""
                  }`
              )
              .join("\n");

            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
              "{{news}}",
              articlesText
            );

            const response = await step.ai.infer("summary", {
              model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
              body: {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
              },
            });

            const part = response.candidates?.[0]?.content?.parts?.[0];
            const newsContent =
              (part && "text" in part ? part.text : null) ||
              "Here is your daily market update.";

            return { user, newsContent };
          } catch (err) {
            console.error("SUMMARY ERROR:", user.email, err);
            return {
              user,
              newsContent:
                "We had an issue generating your news summary today.",
            };
          }
        })
      );
    });

    await step.run("send-emails", async () => {
      for (const { user, newsContent } of summaries) {
        try {
          await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        } catch (err) {
          console.error("EMAIL ERROR:", user.email, err);
        }
      }
    });

    console.log("🟢 DAILY NEWS SUMMARY DONE");

    return { success: true };
  }
);
