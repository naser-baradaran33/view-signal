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
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userEmail) {
      console.warn("No user email, cannot modify watchlist");
      return;
    }

    const next = !added;
    setAdded(next);
    setLoading(true);

    try {
      await fetch("/api/watchlist", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userEmail,
          symbol,
          company,
        }),
      });
    } catch (err) {
      console.error("WATCHLIST TOGGLE ERROR:", err);
      // rollback on error
      setAdded(!next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`watchlist-btn ${added ? "watchlist-remove" : ""}`}
      onClick={handleClick}
      disabled={loading || !userEmail}
    >
      <span>
        {loading
          ? "Updating..."
          : added
          ? "Remove from Watchlist"
          : "Add to Watchlist"}
      </span>
    </button>
  );
}
