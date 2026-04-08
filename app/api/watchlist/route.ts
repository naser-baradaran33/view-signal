import { NextResponse } from "next/server";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "@/lib/actions/watchlist.actions";

export async function POST(req: Request) {
  const { userId, symbol, company } = await req.json();

  try {
    await addToWatchlist({ userId, symbol, company });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ADD WATCHLIST ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { userId, symbol } = await req.json();

  try {
    await removeFromWatchlist({ userId, symbol });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("REMOVE WATCHLIST ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
