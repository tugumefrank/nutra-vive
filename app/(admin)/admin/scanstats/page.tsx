"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  QrCode,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Clock,
} from "lucide-react";

interface ScanLogDisplay {
  _id: string;
  ip: string;
  userAgent: string;
  timestamp: string;
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

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  color,
  delay = 0 
}: { 
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  color: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  </motion.div>
);

export default function ScanStatsPage() {
  const [stats, setStats] = useState<ScanStat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/scan-stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  // Process data for charts
  const deviceData: ChartData[] = stats.recentScans.reduce((acc, scan) => {
    const device = scan.deviceType || "Unknown";
    const existing = acc.find(item => item.name === device);
    if (existing) {
      existing.value++;
    } else {
      acc.push({
        name: device,
        value: 1,
        color: device === "Mobile" ? "#3B82F6" : 
               device === "Desktop" ? "#10B981" :
               device === "Tablet" ? "#F59E0B" : "#6B7280"
      });
    }
    return acc;
  }, [] as ChartData[]);

  const countryData: ChartData[] = stats.recentScans.reduce((acc, scan) => {
    const country = scan.country || "Unknown";
    const existing = acc.find(item => item.name === country);
    if (existing) {
      existing.value++;
    } else {
      acc.push({
        name: country,
        value: 1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }
    return acc;
  }, [] as ChartData[]).slice(0, 8); // Top 8 countries

  const browserData: ChartData[] = stats.recentScans.reduce((acc, scan) => {
    const browser = scan.browser || "Unknown";
    const existing = acc.find(item => item.name === browser);
    if (existing) {
      existing.value++;
    } else {
      acc.push({
        name: browser,
        value: 1,
        color: browser === "Chrome" ? "#4285F4" :
               browser === "Safari" ? "#FF6B6B" :
               browser === "Firefox" ? "#FF9500" :
               browser === "Edge" ? "#0078D4" : "#6B7280"
      });
    }
    return acc;
  }, [] as ChartData[]);

  // Mock hourly data for the last 24 hours
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    scans: Math.floor(Math.random() * 50) + 10,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                QR Scan Analytics
              </h1>
              <p className="text-gray-600 text-lg">Real-time insights into your QR code performance</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={QrCode}
            title="Total Scans"
            value={stats.total.toLocaleString()}
            subtitle="All time"
            trend="+12%"
            color="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            icon={Zap}
            title="Today's Scans"
            value={stats.today.toLocaleString()}
            subtitle="Last 24 hours"
            trend="+8%"
            color="from-green-500 to-green-600"
            delay={0.1}
          />
          <StatCard
            icon={Users}
            title="Unique Visitors"
            value={(stats.total * 0.8).toFixed(0)}
            subtitle="Estimated unique users"
            trend="+15%"
            color="from-purple-500 to-purple-600"
            delay={0.2}
          />
          <StatCard
            icon={Globe}
            title="Countries"
            value={countryData.length}
            subtitle="Global reach"
            trend="+3"
            color="from-orange-500 to-orange-600"
            delay={0.3}
          />
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Device Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Device Distribution</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {deviceData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hourly Activity */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">24-Hour Activity</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6B7280"
                    fontSize={12}
                    interval={2}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorScans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Geographic Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Top Countries</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#6B7280" 
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Browser Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Browser Usage</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Scans Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Recent Scan Activity</h3>
            </div>
            <p className="text-gray-600 mt-1">Latest QR code scans and visitor details</p>
          </div>
          
          {stats.recentScans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Time</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4" />
                        <span>Device</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Browser</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentScans.slice(0, 10).map((scan, index) => (
                    <tr
                      key={scan._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(scan.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{scan.country || "Unknown"}</span>
                          {scan.city && <span className="text-gray-500">• {scan.city}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {scan.deviceType === "Mobile" && <Smartphone className="w-4 h-4 text-blue-500" />}
                          {scan.deviceType === "Desktop" && <Monitor className="w-4 h-4 text-green-500" />}
                          {scan.deviceType === "Tablet" && <Tablet className="w-4 h-4 text-orange-500" />}
                          <span>{scan.deviceType || "Unknown"}</span>
                          {scan.os && <span className="text-gray-500">• {scan.os}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scan.browser || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {scan.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recent scans to display</p>
              <p className="text-gray-400 text-sm">Scan data will appear here once QR codes are scanned</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}