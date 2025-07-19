// "use client";

// import { format } from "date-fns";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";

// import { IOrder } from "@/lib/db/models";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   OrderStatusBadge,
//   PaymentStatusBadge,
//   StatusTimeline,
// } from "./OrderStatusBadge";
// import { OrderActions } from "./OrderActions";
// import {
//   Package,
//   User,
//   MapPin,
//   CreditCard,
//   Truck,
//   Calendar,
//   DollarSign,
//   Hash,
//   Phone,
//   Mail,
//   Building,
//   ShoppingBag,
//   Star,
// } from "lucide-react";

// interface OrderDetailsProps {
//   order: IOrder;
// }

// export function OrderDetails({ order }: OrderDetailsProps) {
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 },
//   };

//   return (
//     <motion.div
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="space-y-6"
//     >
//       {/* Header Section */}
//       <motion.div variants={itemVariants}>
//         <Card className="border-0 shadow-xl bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
//           <CardContent className="p-6">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//               <div className="space-y-4">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
//                     <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
//                   </div>
//                   <div>
//                     <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
//                       {order.orderNumber}
//                     </h1>
//                     <p className="text-slate-600 dark:text-slate-400">
//                       Placed on{" "}
//                       {format(new Date(order.createdAt), "MMMM dd, yyyy")} at{" "}
//                       {format(new Date(order.createdAt), "h:mm a")}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-3">
//                   <OrderStatusBadge status={order.status} size="lg" />
//                   <PaymentStatusBadge status={order.paymentStatus} size="lg" />
//                   {order.trackingNumber && (
//                     <Badge
//                       variant="outline"
//                       className="gap-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
//                     >
//                       <Truck className="h-4 w-4" />
//                       Tracking: {order.trackingNumber}
//                     </Badge>
//                   )}
//                 </div>
//               </div>

//               <div className="text-right space-y-2">
//                 <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
//                   ${order.totalAmount.toFixed(2)}
//                 </div>
//                 <div className="text-sm text-slate-500 dark:text-slate-400">
//                   {order.items.length} item{order.items.length > 1 ? "s" : ""}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Order Items & Timeline */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Order Items */}
//           <motion.div variants={itemVariants}>
//             <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                   Order Items
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {order.items.map((item, index) => (
//                   <motion.div
//                     key={index}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                     className="flex items-center gap-4 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
//                   >
//                     <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
//                       <Image
//                         src={item.productImage || "/placeholder-product.jpg"}
//                         alt={item.productName}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <Link
//                         href={`/admin/products/${item.product}`}
//                         className="font-medium text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
//                       >
//                         {item.productName}
//                       </Link>
//                       <p className="text-sm text-slate-500 dark:text-slate-400">
//                         SKU: {item.productSlug}
//                       </p>
//                     </div>

//                     <div className="text-center">
//                       <p className="font-medium text-slate-900 dark:text-slate-100">
//                         Qty: {item.quantity}
//                       </p>
//                       <p className="text-sm text-slate-500 dark:text-slate-400">
//                         ${item.price.toFixed(2)} each
//                       </p>
//                     </div>

//                     <div className="text-right">
//                       <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
//                         ${item.totalPrice.toFixed(2)}
//                       </p>
//                     </div>
//                   </motion.div>
//                 ))}

//                 {/* Order Totals */}
//                 <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-slate-600 dark:text-slate-400">
//                       Subtotal
//                     </span>
//                     <span className="font-medium">
//                       ${order.subtotal.toFixed(2)}
//                     </span>
//                   </div>
//                   {order.discountAmount > 0 && (
//                     <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
//                       <span>Discount</span>
//                       <span>-${order.discountAmount.toFixed(2)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between text-sm">
//                     <span className="text-slate-600 dark:text-slate-400">
//                       Shipping
//                     </span>
//                     <span className="font-medium">
//                       {order.shippingAmount === 0
//                         ? "Free"
//                         : `$${order.shippingAmount.toFixed(2)}`}
//                     </span>
//                   </div>
//                   {order.taxAmount > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-slate-600 dark:text-slate-400">
//                         Tax
//                       </span>
//                       <span className="font-medium">
//                         ${order.taxAmount.toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                   <Separator />
//                   <div className="flex justify-between text-lg font-bold">
//                     <span>Total</span>
//                     <span>
//                       ${order.totalAmount.toFixed(2)}{" "}
//                       {order.currency.toUpperCase()}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Order Timeline */}
//           <motion.div variants={itemVariants}>
//             <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                   Order Timeline
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <StatusTimeline
//                   orderStatus={order.status}
//                   createdAt={new Date(order.createdAt)}
//                   shippedAt={
//                     order.shippedAt ? new Date(order.shippedAt) : undefined
//                   }
//                   deliveredAt={
//                     order.deliveredAt ? new Date(order.deliveredAt) : undefined
//                   }
//                 />
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>

//         {/* Right Column - Customer & Actions */}
//         <div className="space-y-6">
//           {/* Customer Information */}
//           <motion.div variants={itemVariants}>
//             <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                   Customer
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src={(order as any).user?.imageUrl} />
//                     <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
//                       {order.shippingAddress.firstName[0]}
//                       {order.shippingAddress.lastName[0]}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="font-semibold text-slate-900 dark:text-slate-100">
//                       {order.shippingAddress.firstName}{" "}
//                       {order.shippingAddress.lastName}
//                     </p>
//                     <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
//                       <Mail className="h-3 w-3" />
//                       {order.email}
//                     </p>
//                     {order.shippingAddress.phone && (
//                       <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
//                         <Phone className="h-3 w-3" />
//                         {order.shippingAddress.phone}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Shipping Address */}
//           <motion.div variants={itemVariants}>
//             <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                   Shipping Address
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 {order.shippingAddress.company && (
//                   <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
//                     <Building className="h-4 w-4" />
//                     {order.shippingAddress.company}
//                   </p>
//                 )}
//                 <div className="text-slate-900 dark:text-slate-100">
//                   <p>{order.shippingAddress.address1}</p>
//                   {order.shippingAddress.address2 && (
//                     <p>{order.shippingAddress.address2}</p>
//                   )}
//                   <p>
//                     {order.shippingAddress.city},{" "}
//                     {order.shippingAddress.province} {order.shippingAddress.zip}
//                   </p>
//                   <p>{order.shippingAddress.country}</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Payment Information */}
//           <motion.div variants={itemVariants}>
//             <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                   Payment
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-slate-600 dark:text-slate-400">
//                     Status
//                   </span>
//                   <PaymentStatusBadge status={order.paymentStatus} />
//                 </div>
//                 {order.paymentIntentId && (
//                   <div className="flex items-center justify-between">
//                     <span className="text-slate-600 dark:text-slate-400">
//                       Payment ID
//                     </span>
//                     <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
//                       {order.paymentIntentId}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex items-center justify-between">
//                   <span className="text-slate-600 dark:text-slate-400">
//                     Method
//                   </span>
//                   <span className="text-slate-900 dark:text-slate-100">
//                     Credit Card
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Order Actions */}
//           <motion.div variants={itemVariants}>
//             <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle>Quick Actions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <OrderActions
//                   orderId={order._id}
//                   currentStatus={order.status}
//                   currentPaymentStatus={order.paymentStatus}
//                   orderNumber={order.orderNumber}
//                   totalAmount={order.totalAmount}
//                 />
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Order Notes */}
//           {order.notes && (
//             <motion.div variants={itemVariants}>
//               <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
//                 <CardHeader>
//                   <CardTitle>Order Notes</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-slate-600 dark:text-slate-400">
//                     {order.notes}
//                   </p>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// }
// components/admin/orders/OrderDetails.tsx - Fixed Link href issue

"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { IOrder } from "@/lib/db/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  StatusTimeline,
} from "./OrderStatusBadge";
import { OrderActions } from "./OrderActions";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  DollarSign,
  Hash,
  Phone,
  Mail,
  Building,
  ShoppingBag,
  Star,
} from "lucide-react";

interface OrderDetailsProps {
  order: IOrder;
}

export function OrderDetails({ order }: OrderDetailsProps) {
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Helper function to get product ID as string
  const getProductId = (product: any): string => {
    if (typeof product === "string") return product;
    if (product?._id) return product._id.toString();
    if (product?.id) return product.id.toString();
    return "";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
                    <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {order.orderNumber}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Placed on{" "}
                      {format(new Date(order.createdAt), "MMMM dd, yyyy")} at{" "}
                      {format(new Date(order.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <OrderStatusBadge status={order.status} size="lg" />
                  <PaymentStatusBadge status={order.paymentStatus} size="lg" />
                  {order.trackingNumber && (
                    <Badge
                      variant="outline"
                      className="gap-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                    >
                      <Truck className="h-4 w-4" />
                      Tracking: {order.trackingNumber}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  ${order.totalAmount.toFixed(2)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => {
                  const productId = getProductId(item.product);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {/* Mobile Layout: Stack vertically */}
                      <div className="block sm:hidden space-y-3">
                        {/* Top row: Image + Product info */}
                        <div className="flex items-start gap-3">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
                            <Image
                              src={item.productImage || "/placeholder-product.jpg"}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {productId ? (
                              <Link
                                href={`/admin/products/${productId}`}
                                className="font-medium text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block"
                              >
                                {item.productName}
                              </Link>
                            ) : (
                              <span className="font-medium text-slate-900 dark:text-slate-100 block">
                                {item.productName}
                              </span>
                            )}
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              SKU: {item.productSlug}
                            </p>
                          </div>
                        </div>
                        
                        {/* Bottom row: Quantity, Price, Total */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                          <div className="text-sm">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 ml-3">
                              ${item.price.toFixed(2)} each
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                              ${item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout: Keep horizontal */}
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                          <Image
                            src={item.productImage || "/placeholder-product.jpg"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {productId ? (
                            <Link
                              href={`/admin/products/${productId}`}
                              className="font-medium text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                              {item.productName}
                            </Link>
                          ) : (
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {item.productName}
                            </span>
                          )}
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            SKU: {item.productSlug}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Order Totals */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Shipping
                    </span>
                    <span className="font-medium">
                      {order.shippingAmount === 0
                        ? "Free"
                        : `$${order.shippingAmount.toFixed(2)}`}
                    </span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Tax
                      </span>
                      <span className="font-medium">
                        ${order.taxAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      ${order.totalAmount.toFixed(2)}{" "}
                      {order.currency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Timeline */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline
                  orderStatus={order.status}
                  createdAt={new Date(order.createdAt)}
                  shippedAt={
                    order.shippedAt ? new Date(order.shippedAt) : undefined
                  }
                  deliveredAt={
                    order.deliveredAt ? new Date(order.deliveredAt) : undefined
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(order as any).user?.imageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
                      {order.shippingAddress.firstName[0]}
                      {order.shippingAddress.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {order.email}
                    </p>
                    {order.shippingAddress.phone && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.shippingAddress.company && (
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building className="h-4 w-4" />
                    {order.shippingAddress.company}
                  </p>
                )}
                <div className="text-slate-900 dark:text-slate-100">
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.province} {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Status
                  </span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                {order.paymentIntentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Payment ID
                    </span>
                    <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                      {order.paymentIntentId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Method
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">
                    Credit Card
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderActions
                  orderId={order._id}
                  currentStatus={order.status}
                  currentPaymentStatus={order.paymentStatus}
                  orderNumber={order.orderNumber}
                  totalAmount={order.totalAmount}
                  customerEmail={order.email}
                  customerName={`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Notes */}
          {order.notes && (
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    {order.notes}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
