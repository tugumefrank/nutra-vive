"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

import { exportOrders } from "@/lib/actions/orderServerActions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
} from "lucide-react";

interface ExportFilters {
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  format: "csv" | "excel" | "pdf";
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const paymentStatusOptions = [
  { value: "all", label: "All Payments" },
  { value: "pending", label: "Payment Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Payment Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially Refunded" },
];

const exportFormats = [
  {
    value: "csv",
    label: "CSV",
    description: "Comma-separated values for spreadsheet applications",
    icon: FileText,
  },
  {
    value: "excel",
    label: "Excel",
    description: "Microsoft Excel format with advanced formatting",
    icon: FileText,
  },
  {
    value: "pdf",
    label: "PDF",
    description: "Portable document format for reports",
    icon: FileText,
  },
];

const datePresets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This year", days: 365 },
];

export function OrderExport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [filters, setFilters] = useState<ExportFilters>({
    status: "all",
    paymentStatus: "all",
    dateFrom: "",
    dateTo: "",
    format: "csv",
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleFilterChange = (key: keyof ExportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDatePreset = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);

    const newRange = { from, to };
    setDateRange(newRange);
    setFilters((prev) => ({
      ...prev,
      dateFrom: format(from, "yyyy-MM-dd"),
      dateTo: format(to, "yyyy-MM-dd"),
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFilters((prev) => ({
      ...prev,
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    }));
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Select date range";
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
    if (dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "MMM dd, yyyy");
    }
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert "all" values back to empty strings for the server action
      const exportFilters = {
        status: filters.status === "all" ? "" : filters.status,
        paymentStatus:
          filters.paymentStatus === "all" ? "" : filters.paymentStatus,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };

      const result = await exportOrders(exportFilters);

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success && result.data) {
        // Create and download file
        const blob = new Blob([result.data], {
          type:
            filters.format === "csv" ? "text/csv" : "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orders-export-${format(new Date(), "yyyy-MM-dd")}.${filters.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(
          `Orders exported to ${filters.format.toUpperCase()} format`
        );

        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to export orders");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during export");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        key !== "format" && value && value !== "" && value !== "all"
    ).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
        >
          <Download className="h-4 w-4" />
          Export
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 rounded">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Export Orders
          </DialogTitle>
          <DialogDescription>
            Export order data with custom filters and format options
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isExporting ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Export Format Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-1 gap-3">
                  {exportFormats.map((format) => (
                    <div
                      key={format.value}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                        filters.format === format.value
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                      )}
                      onClick={() => handleFilterChange("format", format.value)}
                    >
                      <Checkbox
                        checked={filters.format === format.value}
                        disabled
                      />
                      <format.icon className="h-4 w-4 text-slate-500" />
                      <div className="flex-1">
                        <p className="font-medium">{format.label}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {format.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="grid grid-cols-2 gap-3">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.days}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDatePreset(preset.days)}
                      className="justify-start"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                      className="rounded-md border-0"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) =>
                      handleFilterChange("paymentStatus", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All payments" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Summary */}
              {getActiveFilterCount() > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Active Filters</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {filters.status &&
                      filters.status !== "all" &&
                      `Status: ${statusOptions.find((s) => s.value === filters.status)?.label}`}
                    {filters.status &&
                      filters.status !== "all" &&
                      filters.paymentStatus &&
                      filters.paymentStatus !== "all" &&
                      " • "}
                    {filters.paymentStatus &&
                      filters.paymentStatus !== "all" &&
                      `Payment: ${paymentStatusOptions.find((s) => s.value === filters.paymentStatus)?.label}`}
                    {(filters.status !== "all" ||
                      filters.paymentStatus !== "all") &&
                      (filters.dateFrom || filters.dateTo) &&
                      " • "}
                    {(filters.dateFrom || filters.dateTo) &&
                      "Custom date range"}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <RefreshCw className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <h3 className="text-lg font-semibold mt-4">Exporting Orders</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Please wait while we prepare your export...
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export Orders"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
