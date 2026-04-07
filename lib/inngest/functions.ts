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

export const sendSignUpEmail = inngest.createFunction(
  {
    id: "sign-up-email",
    triggers: {
      event: "app/user.created",
    },
  },
  async ({ event, step }) => {
    const userProfile = `
      - Country: ${event.data.country}
      - Investment goals: ${event.data.investmentGoals}
      - Risk tolerance: ${event.data.riskTolerance}
      - Preferred industry: ${event.data.preferredIndustry}
    `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({ email, name, intro: introText });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  {
    id: "daily-news-summary",
    triggers: {
      event: "app/send.daily.news",
      cron: "0 12 * * *",
    },
  },
  async ({ step }) => {
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users.length === 0)
      return { success: false, message: "No users found for news email" };

    const results = users.map(user => ({
  user,
  articles: [{ title: "Test Article" }]
}));


      for (const user of users) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          articles = (articles || []).slice(0, 6);

          if (!articles.length) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }

          perUser.push({ user, articles });
        } catch (e) {
          perUser.push({ user, articles: [] });
        }
      }

      return perUser;
    });

    const summaries = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2)
        );

 //       const response = await step.ai.infer(`summarize-news-${user.email}`, {
     //model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
//  body: {
 //   contents: [{ role: "user", parts: [{ text: prompt }] }],
//  },
 // timeout: 15000, // 15 seconds
//    });


        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news.";

       for (const { user, articles } of results) {
  summaries.push({ user, newsContent: "Test summary content" });
}


    await step.run("send-news-emails", async () => {
      await Promise.all(
        summaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        })
      );
    });

    return { success: true, message: "Daily news summary emails sent" };
  }
);
