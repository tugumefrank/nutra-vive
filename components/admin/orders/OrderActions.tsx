"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  updateOrderStatus,
  cancelOrder,
  processRefund,
} from "@/lib/actions/orderServerActions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  MessageSquare,
  Edit,
  Share,
  Printer,
  Download,
} from "lucide-react";
import { ContactCustomerModal } from "./ContactCustomerModal";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus?: string;
  orderNumber?: string;
  totalAmount?: number;
  customerEmail?: string;
  customerName?: string;
  compact?: boolean;
}

export function OrderActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
  orderNumber,
  totalAmount,
  customerEmail = "",
  customerName = "",
  compact = false,
}: OrderActionsProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(totalAmount || 0);
  const [refundReason, setRefundReason] = useState("");

  const handleStatusUpdate = async (newStatus: string, tracking?: string) => {
    setIsLoading(true);
    try {
      const result = await updateOrderStatus(
        orderId,
        newStatus as any,
        tracking
      );

      if (result.success) {
        toast.success(`Order ${orderNumber} status updated to ${newStatus}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      const result = await cancelOrder(orderId, cancellationReason);

      if (result.success) {
        toast.success(`Order ${orderNumber} has been cancelled`);
        setShowCancelDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    setIsLoading(true);
    try {
      const result = await processRefund(orderId, refundAmount, refundReason);

      if (result.success) {
        toast.success(
          `Refund of ${refundAmount} processed for order ${orderNumber}`
        );
        setShowRefundDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to process refund");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackingSubmit = () => {
    if (trackingNumber.trim()) {
      handleStatusUpdate("shipped", trackingNumber);
      setShowTrackingDialog(false);
    }
  };

  // Quick Actions handlers
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error('Failed to download invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Error downloading invoice. Please try again.');
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        toast.error('Failed to generate invoice for printing. Please try again.');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast.error('Error printing invoice. Please try again.');
    }
  };

  const handleShareOrder = () => {
    const shareData = {
      title: `Order ${orderNumber}`,
      text: `Check out this order: ${orderNumber}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Order URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy URL to clipboard.');
    });
  };

  // Get available actions based on current status
  const getAvailableActions = () => {
    const actions: Array<{
      label: string;
      icon: any;
      action: () => void;
      variant?: "default" | "destructive";
      disabled?: boolean;
    }> = [];

    // Status progression actions
    if (currentStatus === "pending") {
      actions.push({
        label: "Mark as Processing",
        icon: Package,
        action: () => handleStatusUpdate("processing"),
      });
    }

    if (currentStatus === "processing") {
      actions.push({
        label: "Mark as Shipped",
        icon: Truck,
        action: () => handleStatusUpdate("shipped"),
      });
    }

    if (currentStatus === "shipped") {
      actions.push({
        label: "Mark as Delivered",
        icon: CheckCircle,
        action: () => handleStatusUpdate("delivered"),
      });
    }

    // Payment actions
    if (
      currentPaymentStatus === "paid" &&
      !["cancelled", "refunded"].includes(currentStatus)
    ) {
      actions.push({
        label: "Process Refund",
        icon: DollarSign,
        action: () => setShowRefundDialog(true),
      });
    }

    // Cancel action (not available for delivered orders)
    if (!["delivered", "cancelled", "refunded"].includes(currentStatus)) {
      actions.push({
        label: "Cancel Order",
        icon: XCircle,
        action: () => setShowCancelDialog(true),
        variant: "destructive" as const,
      });
    }

    return actions;
  };

  if (compact) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <ContactCustomerModal
              customerEmail={customerEmail}
              customerName={customerName}
              orderNumber={orderNumber || ""}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Customer
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {getAvailableActions().map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.action}
                className={
                  action.variant === "destructive"
                    ? "text-red-600 dark:text-red-400"
                    : ""
                }
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dialogs */}
        <OrderActionDialogs
          showTrackingDialog={showTrackingDialog}
          setShowTrackingDialog={setShowTrackingDialog}
          showCancelDialog={showCancelDialog}
          setShowCancelDialog={setShowCancelDialog}
          showRefundDialog={showRefundDialog}
          setShowRefundDialog={setShowRefundDialog}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          cancellationReason={cancellationReason}
          setCancellationReason={setCancellationReason}
          refundAmount={refundAmount}
          setRefundAmount={setRefundAmount}
          refundReason={refundReason}
          setRefundReason={setRefundReason}
          orderNumber={orderNumber}
          totalAmount={totalAmount}
          isLoading={isLoading}
          onTrackingSubmit={handleTrackingSubmit}
          onCancelOrder={handleCancelOrder}
          onProcessRefund={handleProcessRefund}
        />
      </>
    );
  }

  // Full action buttons layout
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {getAvailableActions()
          .slice(0, 2)
          .map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={
                  action.variant === "destructive" ? "destructive" : "default"
                }
                size="sm"
                onClick={action.action}
                disabled={isLoading}
                className="gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </motion.div>
          ))}
      </div>

      {/* Secondary Actions */}
      {getAvailableActions().length > 2 && (
        <div className="flex flex-wrap gap-2">
          {getAvailableActions()
            .slice(2)
            .map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                disabled={isLoading}
                className="gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
        </div>
      )}

      {/* Quick Actions - Utility Functions */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShareOrder}>
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handlePrintInvoice}>
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <ContactCustomerModal
            customerEmail={customerEmail}
            customerName={customerName}
            orderNumber={orderNumber || ""}
          />
        </div>
      </div>

      {/* Dialogs */}
      <OrderActionDialogs
        showTrackingDialog={showTrackingDialog}
        setShowTrackingDialog={setShowTrackingDialog}
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        showRefundDialog={showRefundDialog}
        setShowRefundDialog={setShowRefundDialog}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        refundAmount={refundAmount}
        setRefundAmount={setRefundAmount}
        refundReason={refundReason}
        setRefundReason={setRefundReason}
        orderNumber={orderNumber}
        totalAmount={totalAmount}
        isLoading={isLoading}
        onTrackingSubmit={handleTrackingSubmit}
        onCancelOrder={handleCancelOrder}
        onProcessRefund={handleProcessRefund}
      />
    </div>
  );
}

// Separate component for dialogs to reduce complexity
function OrderActionDialogs({
  showTrackingDialog,
  setShowTrackingDialog,
  showCancelDialog,
  setShowCancelDialog,
  showRefundDialog,
  setShowRefundDialog,
  trackingNumber,
  setTrackingNumber,
  cancellationReason,
  setCancellationReason,
  refundAmount,
  setRefundAmount,
  refundReason,
  setRefundReason,
  orderNumber,
  totalAmount,
  isLoading,
  onTrackingSubmit,
  onCancelOrder,
  onProcessRefund,
}: any) {
  return (
    <>
      {/* Add Tracking Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tracking Number</DialogTitle>
            <DialogDescription>
              Add a tracking number to mark order {orderNumber} as shipped.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g., 1Z999AA1012345675"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTrackingDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onTrackingSubmit}
              disabled={!trackingNumber.trim() || isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Truck className="h-4 w-4 mr-2" />
              )}
              Mark as Shipped
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {orderNumber}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancelOrder}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Process Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for order {orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) =>
                    setRefundAmount(parseFloat(e.target.value) || 0)
                  }
                  max={totalAmount}
                  step="0.01"
                  className="pl-7"
                />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Maximum refund: ${totalAmount?.toFixed(2)}
              </p>
            </div>
            <div>
              <Label htmlFor="refundReason">Reason</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onProcessRefund}
              disabled={
                refundAmount <= 0 ||
                refundAmount > (totalAmount || 0) ||
                isLoading
              }
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
