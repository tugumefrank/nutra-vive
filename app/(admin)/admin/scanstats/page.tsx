// === app/admin/scan-stats/page.tsx ===
"use client";

import { useEffect, useState } from "react";

interface ScanLogDisplay {
  // Adjust interface to match IScanLog
  _id: string; // MongoDB _id
  ip: string;
  userAgent: string;
  timestamp: string; // Will be a string after JSON.stringify
  country?: string;
  city?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
}

interface ScanStat {
  total: number;
  today: number;
  recentScans: ScanLogDisplay[];
}

export default function ScanStatsPage() {
  const [stats, setStats] = useState<ScanStat | null>(null);

  useEffect(() => {
    fetch("/api/scan-stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  if (!stats) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QR Scan Stats</h1>
      <p className="text-lg">
        📊 Total Unique Scans: <strong>{stats.total}</strong>
      </p>
      <p className="text-lg">
        📅 Scans Today: <strong>{stats.today}</strong>
      </p>

      <h2 className="text-xl font-bold mt-8 mb-4">Recent Scans</h2>
      {stats.recentScans.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Timestamp</th>
                <th className="py-2 px-4 border-b">IP</th>
                <th className="py-2 px-4 border-b">Country</th>
                <th className="py-2 px-4 border-b">City</th>
                <th className="py-2 px-4 border-b">Device Type</th>
                <th className="py-2 px-4 border-b">OS</th>
                <th className="py-2 px-4 border-b">Browser</th>
                <th className="py-2 px-4 border-b">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentScans.map((scan) => (
                <tr key={scan._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-sm">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">{scan.ip}</td>
                  <td className="py-2 px-4 border-b text-sm">
                    {scan.country || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {scan.city || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {scan.deviceType || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {scan.os || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {scan.browser || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm break-all">
                    {scan.userAgent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No recent scans to display.</p>
      )}
    </div>
  );
}
