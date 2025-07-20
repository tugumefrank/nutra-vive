// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { format, subDays, startOfDay, endOfDay } from "date-fns";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Calendar } from "@/components/ui/calendar";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
// import {
//   Search,
//   Filter,
//   X,
//   Calendar as CalendarIcon,
//   SlidersHorizontal,
//   RotateCcw,
// } from "lucide-react";

// interface OrderFiltersProps {
//   currentFilters: {
//     status?: string;
//     paymentStatus?: string;
//     search?: string;
//     dateFrom?: string;
//     dateTo?: string;
//     page?: number;
//   };
// }

// const statusOptions = [
//   { value: "all", label: "All Statuses" },
//   { value: "pending", label: "Pending" },
//   { value: "processing", label: "Processing" },
//   { value: "shipped", label: "Shipped" },
//   { value: "delivered", label: "Delivered" },
//   { value: "cancelled", label: "Cancelled" },
//   { value: "refunded", label: "Refunded" },
// ];

// const paymentStatusOptions = [
//   { value: "all", label: "All Payments" },
//   { value: "pending", label: "Payment Pending" },
//   { value: "paid", label: "Paid" },
//   { value: "failed", label: "Payment Failed" },
//   { value: "refunded", label: "Refunded" },
//   { value: "partially_refunded", label: "Partially Refunded" },
// ];

// const datePresets = [
//   { label: "Today", value: "today" },
//   { label: "Yesterday", value: "yesterday" },
//   { label: "Last 7 days", value: "week" },
//   { label: "Last 30 days", value: "month" },
//   { label: "Last 90 days", value: "quarter" },
// ];

// export function OrderFilters({ currentFilters }: OrderFiltersProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
//   const [localFilters, setLocalFilters] = useState({
//     search: currentFilters.search || "",
//     status: currentFilters.status || "all",
//     paymentStatus: currentFilters.paymentStatus || "all",
//     dateFrom: currentFilters.dateFrom || "",
//     dateTo: currentFilters.dateTo || "",
//   });

//   const [dateRange, setDateRange] = useState<{
//     from?: Date;
//     to?: Date;
//   }>({
//     from: currentFilters.dateFrom
//       ? new Date(currentFilters.dateFrom)
//       : undefined,
//     to: currentFilters.dateTo ? new Date(currentFilters.dateTo) : undefined,
//   });

//   // Debounced search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (localFilters.search !== currentFilters.search) {
//         applyFilters({ ...localFilters });
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [localFilters.search]);

//   const applyFilters = (filters: typeof localFilters) => {
//     const params = new URLSearchParams(searchParams);

//     // Update or remove parameters
//     Object.entries(filters).forEach(([key, value]) => {
//       // Convert "all" back to empty string for URL params
//       const urlValue = value === "all" ? "" : value;

//       if (urlValue && urlValue !== "") {
//         params.set(key, urlValue);
//       } else {
//         params.delete(key);
//       }
//     });

//     // Reset page when filters change
//     params.delete("page");

//     router.push(`?${params.toString()}`);
//   };

//   const handleFilterChange = (key: string, value: string) => {
//     const newFilters = { ...localFilters, [key]: value };
//     setLocalFilters(newFilters);

//     // Apply immediately for non-search filters
//     if (key !== "search") {
//       applyFilters(newFilters);
//     }
//   };

//   const handleDatePreset = (preset: string) => {
//     let from: Date;
//     let to: Date = endOfDay(new Date());

//     switch (preset) {
//       case "today":
//         from = startOfDay(new Date());
//         break;
//       case "yesterday":
//         from = startOfDay(subDays(new Date(), 1));
//         to = endOfDay(subDays(new Date(), 1));
//         break;
//       case "week":
//         from = startOfDay(subDays(new Date(), 7));
//         break;
//       case "month":
//         from = startOfDay(subDays(new Date(), 30));
//         break;
//       case "quarter":
//         from = startOfDay(subDays(new Date(), 90));
//         break;
//       default:
//         return;
//     }

//     setDateRange({ from, to });
//     const newFilters = {
//       ...localFilters,
//       dateFrom: format(from, "yyyy-MM-dd"),
//       dateTo: format(to, "yyyy-MM-dd"),
//     };
//     setLocalFilters(newFilters);
//     applyFilters(newFilters);
//   };

//   const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
//     setDateRange(range);
//     const newFilters = {
//       ...localFilters,
//       dateFrom: range.from ? format(range.from, "yyyy-MM-dd") : "",
//       dateTo: range.to ? format(range.to, "yyyy-MM-dd") : "",
//     };
//     setLocalFilters(newFilters);
//     applyFilters(newFilters);
//   };

//   const clearAllFilters = () => {
//     const clearedFilters = {
//       search: "",
//       status: "all",
//       paymentStatus: "all",
//       dateFrom: "",
//       dateTo: "",
//     };
//     setLocalFilters(clearedFilters);
//     setDateRange({});
//     applyFilters(clearedFilters);
//   };

//   const getActiveFilterCount = () => {
//     return Object.values(localFilters).filter(
//       (value) => value && value !== "" && value !== "all"
//     ).length;
//   };

//   const formatDateRange = () => {
//     if (!dateRange.from) return "Select dates";
//     if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
//     if (dateRange.from.getTime() === dateRange.to.getTime()) {
//       return format(dateRange.from, "MMM dd, yyyy");
//     }
//     return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
//   };

//   return (
//     <div className="flex items-center gap-2 lg:gap-3 min-w-0">
//       {/* Quick Search */}
//       <div className="relative flex-1 min-w-0 max-w-xs">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
//         <Input
//           placeholder="Search orders..."
//           value={localFilters.search}
//           onChange={(e) => handleFilterChange("search", e.target.value)}
//           className="pl-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm"
//         />
//         {localFilters.search && (
//           <Button
//             variant="ghost"
//             size="sm"
//             className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
//             onClick={() => handleFilterChange("search", "")}
//           >
//             <X className="h-3 w-3" />
//           </Button>
//         )}
//       </div>

//       {/* Quick Status Filter - Hidden on small screens */}
//       <div className="hidden sm:block">
//         <Select
//           value={localFilters.status}
//           onValueChange={(value) => handleFilterChange("status", value)}
//         >
//           <SelectTrigger className="w-[120px] lg:w-[140px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm">
//             <SelectValue placeholder="Status" />
//           </SelectTrigger>
//           <SelectContent>
//             {statusOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Date Range Picker - Hidden on small screens */}
//       <div className="hidden md:block">
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className={cn(
//                 "w-[160px] lg:w-[200px] justify-start text-left font-normal bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm",
//                 !dateRange.from && "text-muted-foreground"
//               )}
//             >
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               <span className="truncate">{formatDateRange()}</span>
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent
//             className="w-auto p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
//             align="start"
//           >
//             <div className="p-3 border-b">
//               <div className="grid grid-cols-2 gap-2">
//                 {datePresets.map((preset) => (
//                   <Button
//                     key={preset.value}
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleDatePreset(preset.value)}
//                     className="justify-start text-xs"
//                   >
//                     {preset.label}
//                   </Button>
//                 ))}
//               </div>
//             </div>
//             <Calendar
//               initialFocus
//               mode="range"
//               defaultMonth={dateRange?.from}
//               selected={{ from: dateRange.from, to: dateRange.to }}
//               onSelect={handleDateRangeChange}
//               numberOfMonths={2}
//             />
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Advanced Filters - Mobile Sheet, Desktop Popover */}
//       <div className="sm:hidden">
//         <Sheet open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
//           <SheetTrigger asChild>
//             <Button variant="outline" size="sm" className="relative p-2">
//               <SlidersHorizontal className="h-4 w-4" />
//               {getActiveFilterCount() > 0 && (
//                 <Badge
//                   variant="secondary"
//                   className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs bg-emerald-500 text-white flex items-center justify-center"
//                 >
//                   {getActiveFilterCount()}
//                 </Badge>
//               )}
//             </Button>
//           </SheetTrigger>
//           <SheetContent side="right" className="w-[350px] sm:w-[400px]">
//             <SheetHeader>
//               <SheetTitle>Filter Orders</SheetTitle>
//               <SheetDescription>
//                 Refine your order search with advanced filters
//               </SheetDescription>
//             </SheetHeader>
//             <AdvancedFiltersContent
//               localFilters={localFilters}
//               handleFilterChange={handleFilterChange}
//               clearAllFilters={clearAllFilters}
//               getActiveFilterCount={getActiveFilterCount}
//               statusOptions={statusOptions}
//               paymentStatusOptions={paymentStatusOptions}
//             />
//           </SheetContent>
//         </Sheet>
//       </div>

//       {/* Advanced Filters - Desktop Popover */}
//       <div className="hidden sm:block">
//         <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
//           <PopoverTrigger asChild>
//             <Button variant="outline" size="sm" className="relative">
//               <SlidersHorizontal className="h-4 w-4 mr-2" />
//               <span className="hidden lg:inline">Advanced</span>
//               {getActiveFilterCount() > 0 && (
//                 <Badge
//                   variant="secondary"
//                   className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs bg-emerald-500 text-white flex items-center justify-center"
//                 >
//                   {getActiveFilterCount()}
//                 </Badge>
//               )}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent
//             className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
//             align="end"
//           >
//             <AdvancedFiltersContent
//               localFilters={localFilters}
//               handleFilterChange={handleFilterChange}
//               clearAllFilters={clearAllFilters}
//               getActiveFilterCount={getActiveFilterCount}
//               statusOptions={statusOptions}
//               paymentStatusOptions={paymentStatusOptions}
//             />
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Clear Filters Button */}
//       <AnimatePresence>
//         {getActiveFilterCount() > 0 && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             className="hidden lg:block"
//           >
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAllFilters}
//               className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
//             >
//               <RotateCcw className="h-4 w-4 mr-2" />
//               Clear
//             </Button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function AdvancedFiltersContent({
//   localFilters,
//   handleFilterChange,
//   clearAllFilters,
//   getActiveFilterCount,
//   statusOptions,
//   paymentStatusOptions,
// }: {
//   localFilters: any;
//   handleFilterChange: (key: string, value: string) => void;
//   clearAllFilters: () => void;
//   getActiveFilterCount: () => number;
//   statusOptions: Array<{ value: string; label: string }>;
//   paymentStatusOptions: Array<{ value: string; label: string }>;
// }) {
//   return (
//     <div className="space-y-6 pt-6">
//       {/* Status Filter - Mobile only */}
//       <div className="space-y-2 sm:hidden">
//         <Label htmlFor="status" className="text-sm font-medium">
//           Order Status
//         </Label>
//         <Select
//           value={localFilters.status}
//           onValueChange={(value) => handleFilterChange("status", value)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="All statuses" />
//           </SelectTrigger>
//           <SelectContent>
//             {statusOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Payment Status */}
//       <div className="space-y-2">
//         <Label htmlFor="paymentStatus" className="text-sm font-medium">
//           Payment Status
//         </Label>
//         <Select
//           value={localFilters.paymentStatus}
//           onValueChange={(value) => handleFilterChange("paymentStatus", value)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="All payment statuses" />
//           </SelectTrigger>
//           <SelectContent>
//             {paymentStatusOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <Separator />

//       {/* Active Filters Summary */}
//       {getActiveFilterCount() > 0 && (
//         <div className="space-y-3">
//           <Label className="text-sm font-medium">Active Filters</Label>
//           <div className="flex flex-wrap gap-2">
//             {localFilters.status && localFilters.status !== "all" && (
//               <Badge variant="secondary" className="gap-1">
//                 Status:{" "}
//                 {
//                   statusOptions.find((s) => s.value === localFilters.status)
//                     ?.label
//                 }
//                 <X
//                   className="h-3 w-3 cursor-pointer"
//                   onClick={() => handleFilterChange("status", "all")}
//                 />
//               </Badge>
//             )}
//             {localFilters.paymentStatus &&
//               localFilters.paymentStatus !== "all" && (
//                 <Badge variant="secondary" className="gap-1">
//                   Payment:{" "}
//                   {
//                     paymentStatusOptions.find(
//                       (s) => s.value === localFilters.paymentStatus
//                     )?.label
//                   }
//                   <X
//                     className="h-3 w-3 cursor-pointer"
//                     onClick={() => handleFilterChange("paymentStatus", "all")}
//                   />
//                 </Badge>
//               )}
//             {localFilters.search && (
//               <Badge variant="secondary" className="gap-1">
//                 Search: "{localFilters.search}"
//                 <X
//                   className="h-3 w-3 cursor-pointer"
//                   onClick={() => handleFilterChange("search", "")}
//                 />
//               </Badge>
//             )}
//             {(localFilters.dateFrom || localFilters.dateTo) && (
//               <Badge variant="secondary" className="gap-1">
//                 Date Range
//                 <X
//                   className="h-3 w-3 cursor-pointer"
//                   onClick={() => {
//                     handleFilterChange("dateFrom", "");
//                     handleFilterChange("dateTo", "");
//                   }}
//                 />
//               </Badge>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="flex gap-2 pt-4 border-t">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={clearAllFilters}
//           disabled={getActiveFilterCount() === 0}
//           className="flex-1"
//         >
//           <RotateCcw className="h-4 w-4 mr-2" />
//           Clear All
//         </Button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  Calendar as CalendarIcon,
  Filter,
  RotateCcw,
} from "lucide-react";

interface OrderFiltersProps {
  currentFilters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
  };
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

const datePresets = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "week" },
  { label: "Last 30 days", value: "month" },
  { label: "Last 90 days", value: "quarter" },
];

export function OrderFilters({ currentFilters }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState({
    search: currentFilters.search || "",
    status: currentFilters.status || "all",
    paymentStatus: currentFilters.paymentStatus || "all",
    dateFrom: currentFilters.dateFrom || "",
    dateTo: currentFilters.dateTo || "",
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: currentFilters.dateFrom
      ? new Date(currentFilters.dateFrom)
      : undefined,
    to: currentFilters.dateTo ? new Date(currentFilters.dateTo) : undefined,
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.search !== currentFilters.search) {
        applyFilters({ ...localFilters });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters.search]);

  const applyFilters = (filters: typeof localFilters) => {
    const params = new URLSearchParams(searchParams);

    // Update or remove parameters
    Object.entries(filters).forEach(([key, value]) => {
      // Convert "all" back to empty string for URL params
      const urlValue = value === "all" ? "" : value;

      if (urlValue && urlValue !== "") {
        params.set(key, urlValue);
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change
    params.set("page", "1");

    // Use replace to avoid navigation and closing modals
    router.replace(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Apply immediately for non-search filters
    if (key !== "search") {
      applyFilters(newFilters);
      // Keep advanced filters open for desktop/mobile
      // The replace navigation shouldn't close the sheet
    }
  };

  const handleDatePreset = (preset: string) => {
    let from: Date;
    let to: Date = endOfDay(new Date());

    switch (preset) {
      case "today":
        from = startOfDay(new Date());
        break;
      case "yesterday":
        from = startOfDay(subDays(new Date(), 1));
        to = endOfDay(subDays(new Date(), 1));
        break;
      case "week":
        from = startOfDay(subDays(new Date(), 7));
        break;
      case "month":
        from = startOfDay(subDays(new Date(), 30));
        break;
      case "quarter":
        from = startOfDay(subDays(new Date(), 90));
        break;
      default:
        return;
    }

    const newRange = { from, to };
    setDateRange(newRange);
    const newFilters = {
      ...localFilters,
      dateFrom: format(from, "yyyy-MM-dd"),
      dateTo: format(to, "yyyy-MM-dd"),
    };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const newFilters = {
      ...localFilters,
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      status: "all",
      paymentStatus: "all",
      dateFrom: "",
      dateTo: "",
    };
    setLocalFilters(clearedFilters);
    setDateRange(undefined);
    applyFilters(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(
      (value) => value && value !== "" && value !== "all"
    ).length;
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Select dates";
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
    if (dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, "MMM dd, yyyy");
    }
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
  };

  return (
    <div className="flex items-center gap-2 lg:gap-3 min-w-0">
      {/* Quick Search */}
      <div className="relative flex-1 min-w-0 max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search orders..."
          value={localFilters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm"
        />
        {localFilters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => handleFilterChange("search", "")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Status Filter - Hidden on small screens */}
      <div className="hidden sm:block">
        <Select
          value={localFilters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[120px] lg:w-[140px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm">
            <SelectValue placeholder="Status" />
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

      {/* Date Range Picker - Hidden on small screens */}
      <div className="hidden md:block">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] lg:w-[200px] justify-start text-left font-normal bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span className="truncate">{formatDateRange()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
            align="start"
          >
            <div className="p-3 border-b">
              <div className="grid grid-cols-2 gap-2">
                {datePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDatePreset(preset.value)}
                    className="justify-start text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
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

      {/* Payment Status Filter - Simple Dropdown */}
      <div className="hidden sm:block">
        <Select
          value={localFilters.paymentStatus}
          onValueChange={(value) => handleFilterChange("paymentStatus", value)}
        >
          <SelectTrigger className="w-[130px] lg:w-[150px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 text-sm">
            <SelectValue placeholder="Payment" />
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

      {/* More Filters - Mobile Dropdown */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative p-2">
              <Filter className="h-4 w-4" />
              {getActiveFilterCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 text-xs bg-emerald-500 text-white flex items-center justify-center"
                >
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
            {paymentStatusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterChange("paymentStatus", option.value)}
                className={localFilters.paymentStatus === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearAllFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clear Filters Button */}
      <AnimatePresence>
        {getActiveFilterCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:block"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

