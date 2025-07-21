"use client";

import { useEffect, useState } from "react";

interface ScanStat {
  total: number;
  today: number;
}

export default function ScanStatsPage() {
  const [stats, setStats] = useState<ScanStat | null>(null);

  useEffect(() => {
    fetch("/api/scan-stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QR Scan Stats</h1>
      <p className="text-lg">
        📊 Total Unique Scans: <strong>{stats.total}</strong>
      </p>
      <p className="text-lg">
        📅 Scans Today: <strong>{stats.today}</strong>
      </p>
    </div>
  );
}
