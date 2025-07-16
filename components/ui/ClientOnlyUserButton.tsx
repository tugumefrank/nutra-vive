"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function ClientOnlyUserButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the UserButton size
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
          userButtonPopoverCard:
            "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm",
          userButtonPopoverActions: "bg-white/50 dark:bg-gray-700/50",
        },
      }}
      afterSignOutUrl="/"
    />
  );
}