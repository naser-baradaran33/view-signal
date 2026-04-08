// lib/email/index.ts
import { resend } from "@/lib/resend";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
} from "./templates";

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: {
  email: string;
  name: string;
  intro: string;
}) => {
  const html = WELCOME_EMAIL_TEMPLATE
    .replace("{{name}}", name)
    .replace("{{intro}}", intro);

  return await resend.emails.send({
    from: "ViewSignal <onboarding@resend.dev>",
    to: email,
    subject: "Welcome to ViewSignal - your stock market toolkit is ready!",
    html,
  });
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}) => {
  const html = NEWS_SUMMARY_EMAIL_TEMPLATE
    .replace("{{date}}", date)
    .replace("{{newsContent}}", newsContent);

  return await resend.emails.send({
    from: "Signalist News <news@resend.dev>",
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    html,
  });
};
