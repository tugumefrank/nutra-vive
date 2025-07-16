// app/account/memberships/components/CheckoutSuccessHandler.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeMembershipCheckout } from "@/lib/actions/membershipSubscriptionActions";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function CheckoutSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSessions] = useState(() => new Set<string>());

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const cancelled = searchParams.get("cancelled");

    if (cancelled === "true") {
      toast.error("Checkout was cancelled");
      // Clean up URL
      router.replace("/account/memberships");
      return;
    }

    // Only process if we have a session_id, not currently processing, and haven't processed this session before
    if (sessionId && !isProcessing && !processedSessions.has(sessionId)) {
      processedSessions.add(sessionId);
      handleCheckoutSuccess(sessionId);
    }
  }, [searchParams, router, isProcessing, processedSessions]);

  const handleCheckoutSuccess = async (sessionId: string) => {
    setIsProcessing(true);

    try {
      console.log("Processing checkout success for session:", sessionId);
      
      const result = await completeMembershipCheckout(sessionId);
      
      if (result.success) {
        toast.success("🎉 Membership activated successfully!");
        
        // Clean up URL - this will trigger MembershipDashboard to refresh via navigation
        router.replace("/account/memberships");
        
        // Small delay to ensure URL change takes effect, then trigger a refresh event
        setTimeout(() => {
          // Trigger a custom event that MembershipDashboard can listen for
          window.dispatchEvent(new CustomEvent('membershipUpdated'));
        }, 100);
        
        // Note: Removed window.location.reload() as it was causing infinite loops
      } else {
        throw new Error(result.error || "Failed to complete checkout");
      }
    } catch (error) {
      console.error("Checkout completion error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to complete checkout";
      toast.error(errorMessage);
      
      // Still clean up URL even on error
      router.replace("/account/memberships");
    } finally {
      setIsProcessing(false);
    }
  };

  // Only show processing UI if we have a session_id
  const sessionId = searchParams.get("session_id");
  
  if (!sessionId || !isProcessing) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Processing Your Membership</h3>
        <p className="text-muted-foreground text-sm">
          Please wait while we activate your subscription...
        </p>
      </div>
    </div>
  );
}