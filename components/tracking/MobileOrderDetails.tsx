"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Package,
  Star,
  Heart,
  Gift,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import ContactSupportDialog from "@/components/tracking/ContactSupportDialog";

interface MobileOrderDetailsProps {
  order: any;
  trackingInfo: any;
}

const SectionCard = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = false,
  gradient = "from-blue-500 to-purple-600"
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  gradient?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden"
    >
      <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-lg">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const ProductItem = ({ item, formatPrice }: { item: any; formatPrice: (price: number) => string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30"
  >
    <div className="relative w-16 h-16 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
      {item.productImage ? (
        <Image
          src={item.productImage}
          alt={item.productName}
          width={64}
          height={64}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {/* Overlay with wellness icons */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-1">
        <div className="flex space-x-1">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <Heart className="w-3 h-3 text-red-400" />
        </div>
      </div>
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
        {item.productName}
      </h4>
      <div className="flex items-center space-x-2 mt-1">
        <Badge variant="outline" className="text-xs bg-white/60 dark:bg-gray-800/60">
          Qty: {item.quantity}
        </Badge>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          × {formatPrice(item.price)}
        </span>
      </div>
      
      {item.appliedDiscount && item.appliedDiscount > 0 && (
        <div className="flex items-center space-x-1 mt-1">
          <Gift className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            ${item.appliedDiscount.toFixed(2)} saved
          </span>
        </div>
      )}
    </div>
    
    <div className="text-right">
      <div className="font-bold text-lg text-gray-900 dark:text-white">
        {formatPrice(item.totalPrice)}
      </div>
      {item.originalPrice && item.originalPrice > item.price && (
        <div className="text-xs text-gray-400 line-through">
          {formatPrice(item.originalPrice * item.quantity)}
        </div>
      )}
    </div>
  </motion.div>
);

export default function MobileOrderDetails({
  order,
  trackingInfo,
}: MobileOrderDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency || "USD",
    }).format(price);
  };


  return (
    <div className="space-y-4">
      {/* Order Items */}
      <SectionCard
        title={`Items (${order.items.length})`}
        icon={Package}
        gradient="from-purple-500 to-pink-600"
        defaultExpanded={true}
      >
        <div className="space-y-3">
          {order.items.map((item: any, index: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductItem item={item} formatPrice={formatPrice} />
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Support Section */}
      <SectionCard
        title="Need Help?"
        icon={Heart}
        gradient="from-pink-500 to-rose-600"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Our wellness support team is here to help with your order.
          </p>
          
          <div className="flex justify-center">
            <ContactSupportDialog
              orderNumber={trackingInfo?.orderNumber}
              customerEmail={order?.email}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}