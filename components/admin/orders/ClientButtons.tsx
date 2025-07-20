"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer, Share, Truck, XCircle, DollarSign } from "lucide-react";
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
import { 
  updateOrderStatus,
  cancelOrder,
  processRefund,
} from "@/lib/actions/orderServerActions";
import { toast } from "sonner";
import { useState } from "react";

interface ClientButtonsProps {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  currentPaymentStatus?: string;
  totalAmount?: number;
  customerEmail: string;
  customerName: string;
}

export function ClientButtons({ 
  orderId, 
  orderNumber, 
  currentStatus, 
  currentPaymentStatus, 
  totalAmount, 
  customerEmail, 
  customerName
}: ClientButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{status: string, label: string} | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(totalAmount || 0);
  const [refundReason, setRefundReason] = useState("");

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
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
        console.error('Failed to download invoice');
        alert('Failed to download invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Error downloading invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open PDF in new window for printing
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } else {
        console.error('Failed to generate invoice for printing');
        alert('Failed to generate invoice for printing. Please try again.');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Error printing invoice. Please try again.');
    }
  };

  const handleShareOrder = () => {
    const shareData = {
      title: `Order ${orderNumber}`,
      text: `Check out this order: ${orderNumber}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((error) => {
        console.error('Error sharing:', error);
        // Fallback to copying URL
        copyToClipboard();
      });
    } else {
      // Fallback to copying URL
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Order URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL to clipboard.');
    });
  };

  // Status change confirmation handler
  const handleStatusChangeRequest = (newStatus: string, label: string) => {
    setPendingStatusChange({ status: newStatus, label });
    setShowStatusConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    
    setShowStatusConfirmDialog(false);
    await handleStatusUpdate(pendingStatusChange.status);
    setPendingStatusChange(null);
  };

  // Order action handlers
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
        window.location.reload();
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
        window.location.reload();
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
          `Refund of $${refundAmount} processed for order ${orderNumber}`
        );
        setShowRefundDialog(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to process refund");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if actions are available
  const canCancel = !["delivered", "cancelled", "refunded"].includes(currentStatus);
  const canRefund = currentPaymentStatus === "paid" && !["cancelled", "refunded"].includes(currentStatus);

  // Get available status actions
  const getStatusActions = () => {
    const actions = [];
    
    if (currentStatus === "pending") {
      actions.push({
        label: "Mark as Processing",
        action: () => handleStatusChangeRequest("processing", "Processing"),
        icon: "📦"
      });
    }
    
    if (currentStatus === "processing") {
      actions.push({
        label: "Mark as Shipped", 
        action: () => handleStatusChangeRequest("shipped", "Shipped"),
        icon: "🚚"
      });
    }
    
    if (currentStatus === "shipped") {
      actions.push({
        label: "Mark as Delivered",
        action: () => handleStatusChangeRequest("delivered", "Delivered"), 
        icon: "✅"
      });
    }
    
    return actions;
  };

  return (
    <>
      {/* Top Section: Order State Changes + Cancel + Refund */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        {/* Order Status Actions */}
        {getStatusActions().map((action, index) => (
          <Button
            key={index}
            variant="default"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={action.action}
            disabled={isLoading}
          >
            <span>{action.icon}</span>
            {action.label}
          </Button>
        ))}

        {/* Cancel Order */}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full sm:w-auto"
            onClick={() => setShowCancelDialog(true)}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4" />
            Cancel Order
          </Button>
        )}

        {/* Process Refund */}
        {canRefund && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={() => setShowRefundDialog(true)}
            disabled={isLoading}
          >
            <DollarSign className="h-4 w-4" />
            Process Refund
          </Button>
        )}
      </div>

      {/* Dialogs */}

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusConfirmDialog} onOpenChange={setShowStatusConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusChange && (
                <>
                  You are about to change order {orderNumber} status to <strong>{pendingStatusChange.label}</strong>.
                  <br /><br />
                  <strong>⚠️ Important:</strong> The customer ({customerName}) will automatically receive an email notification about this status change.
                  <br /><br />
                  Do you want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Updating..." : "Yes, Update Status"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {orderNumber}? This action cannot be undone.
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
              onClick={handleCancelOrder}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
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
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
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
              onClick={handleProcessRefund}
              disabled={
                refundAmount <= 0 ||
                refundAmount > (totalAmount || 0) ||
                isLoading
              }
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TryAgainButton() {
  return (
    <Button onClick={() => window.location.reload()}>
      Try Again
    </Button>
  );
}

export function FloatingActionButtons({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
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
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setIsDownloading(false);
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
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 lg:hidden">
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          className="rounded-full h-12 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-12 w-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-lg"
          onClick={handlePrintInvoice}
        >
          <Printer className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}