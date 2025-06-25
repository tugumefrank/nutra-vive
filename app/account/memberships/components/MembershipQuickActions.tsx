// app/(account)/account/memberships/components/MembershipQuickActions.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  CreditCard,
  Settings,
  Gift,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMembership } from "../hooks/useMembership";

export function MembershipQuickActions() {
  const { membership, benefits } = useMembership();

  if (!membership || !benefits) return null;

  const quickActions = [
    {
      icon: ShoppingBag,
      label: "Shop Free Products",
      description: `${benefits.availableProducts} products available`,
      href: "/shop?membership=true",
      color: "bg-emerald-500 hover:bg-emerald-600",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      icon: CreditCard,
      label: "Billing & Payment",
      description: "Manage your subscription",
      href: "/account/billing",
      color: "bg-blue-500 hover:bg-blue-600",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Settings,
      label: "Membership Settings",
      description: "Update preferences",
      href: "/account/memberships/settings",
      color: "bg-purple-500 hover:bg-purple-600",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quickActions.map((action, index) => {
        const IconComponent = action.icon;

        return (
          <Link key={index} href={action.href}>
            <Card className="glass-card border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${action.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
