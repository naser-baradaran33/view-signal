"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export async function getWatchlistSymbolsByEmail(email: string) {
  await connectToDatabase();
  const items = await Watchlist.find({ userId: email }).lean();
  return items.map((i) => i.symbol as string);
}

export async function addToWatchlist({
  userId,
  symbol,
  company,
}: {
  userId: string;
  symbol: string;
  company: string;
}) {
  await connectToDatabase();
  await Watchlist.updateOne(
    { userId, symbol },
    { userId, symbol, company, addedAt: new Date() },
    { upsert: true }
  );
}

export async function removeFromWatchlist({
  userId,
  symbol,
}: {
  userId: string;
  symbol: string;
}) {
  await connectToDatabase();
  await Watchlist.deleteOne({ userId, symbol });
}
