"use client";


import { useState } from "react";

type WatchlistButtonProps = {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  userEmail: string | null;
};

export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist,
  userEmail,
}: WatchlistButtonProps) {
  const [added, setAdded] = useState(isInWatchlist);

  const toggle = async () => {
    if (!userEmail) return;

    const next = !added;
    setAdded(next);

    await fetch("/api/watchlist", {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userEmail,
        symbol,
        company,
      }),
    });
  };

  return (
    <button onClick={toggle} className="watchlist-btn">
      {added ? "Remove from Watchlist" : "Add to Watchlist"}
    </button>
  );
}
