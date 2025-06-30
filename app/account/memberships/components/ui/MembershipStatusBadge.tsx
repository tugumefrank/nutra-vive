// components/ui/MembershipStatusBadge.tsx (for mobile navigation integration)
"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, Gift, Star, Zap } from "lucide-react";
import { useMembership } from "../../hooks/useMembership";

const tierConfig = {
  basic: { icon: Gift, color: "bg-emerald-500" },
  premium: { icon: Star, color: "bg-blue-500" },
  vip: { icon: Crown, color: "bg-purple-500" },
  elite: { icon: Zap, color: "bg-amber-500" },
};

export function MembershipStatusBadge() {
  const { membership, benefits, loading } = useMembership();

  if (loading || !membership || !benefits) return null;

  const config =
    tierConfig[membership.membership.tier as keyof typeof tierConfig];
  const IconComponent = config.icon;

  return (
    <Badge
      className={`${config.color} hover:${config.color}/90 text-white border-0 gap-1 text-xs px-2 py-1`}
    >
      <IconComponent className="w-3 h-3" />
      <span className="capitalize">{membership.membership.tier}</span>
      <span className="text-white/80">•</span>
      <span>{benefits.availableProducts}</span>
    </Badge>
  );
}
