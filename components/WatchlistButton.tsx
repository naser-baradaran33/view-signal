"use client";


import { useState } from "react";



export default function WatchlistButton({
  symbol,
  company,
  isInWatchlist,
  userEmail,
}) {
  const [added, setAdded] = useState(isInWatchlist);

  const toggle = async () => {
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
