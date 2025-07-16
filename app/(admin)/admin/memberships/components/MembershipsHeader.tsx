// app/admin/memberships/components/MembershipsHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Plus, Crown, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemberships } from "./MembershipsProvider";
import { useState } from "react";
import { toast } from "sonner";
import { syncAllMembershipsWithStripe } from "@/lib/actions/membershipServerActions";

export default function MembershipsHeader() {
  const { setIsCreateDialogOpen } = useMemberships();
  const [isLoading, setIsLoading] = useState(false);

  const handleStripeSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAllMembershipsWithStripe();
      
      if (result.success) {
        const successCount = result.results?.filter(r => r.success).length || 0;
        const totalCount = result.results?.length || 0;
        
        if (successCount === totalCount) {
          toast.success(`✅ Successfully synced ${successCount} memberships with Stripe`);
        } else {
          toast.warning(`⚠️ Synced ${successCount}/${totalCount} memberships. Some had issues.`);
        }
        
        // Log detailed results
        result.results?.forEach(r => {
          if (r.success) {
            console.log(`✅ ${r.name}: ${r.stripePriceId}`);
          } else {
            console.error(`❌ ${r.name}: ${r.error}`);
          }
        });
      } else {
        toast.error(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("❌ Failed to sync memberships with Stripe");
      console.error("Stripe sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
                  Membership Plans
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">
                  Create and manage subscription tiers with custom benefits and
                  product allocations
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="w-full space-y-2"
            >
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="default"
                className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Create Membership
              </Button>
              
              <Button
                onClick={handleStripeSync}
                disabled={isLoading}
                size="default"
                variant="outline"
                className="w-full relative overflow-hidden group hover:bg-orange-50 hover:border-orange-300 transition-all duration-300"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Syncing...' : 'Sync with Stripe'}
              </Button>
            </motion.div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Membership Plans
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Create and manage subscription tiers with custom benefits
                    and product allocations
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex gap-3"
            >
              <Button
                onClick={handleStripeSync}
                disabled={isLoading}
                size="lg"
                variant="outline"
                className="relative overflow-hidden group hover:bg-orange-50 hover:border-orange-300 transition-all duration-300"
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Syncing...' : 'Sync with Stripe'}
              </Button>
              
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="lg"
                className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="mr-2 h-5 w-5" />
                Create Membership
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
