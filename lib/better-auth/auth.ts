import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";
import { inngest } from "@/lib/inngest/client";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
  if (authInstance) return authInstance;

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) throw new Error("MongoDB connection not found");

  authInstance = betterAuth({
    database: mongodbAdapter(db as any),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,

    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },

    plugins: [nextCookies()],

    events: {
      user: {
        async created({ user }) {
          console.log("BetterAuth user created:", user.email);

          await inngest.send({
            name: "app/user.created",
            data: {
              email: user.email,
              name: user.name ?? "",
              country: user.country ?? "",
              investmentGoals: user.investmentGoals ?? "",
              riskTolerance: user.riskTolerance ?? "",
              preferredIndustry: user.preferredIndustry ?? "",
            },
          });
        },
      },
    },
  });

  return authInstance;
};

export const auth = await getAuth();
