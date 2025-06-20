// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import {
//   ArrowLeft,
//   Shield,
//   CreditCard,
//   Truck,
//   Store,
//   MapPin,
//   Phone,
//   Mail,
//   User,
//   Home,
//   Building,
//   Check,
//   Lock,
//   Zap,
//   Gift,
//   Loader2,
//   AlertCircle,
//   Package,
// } from "lucide-react";
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
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

// import { getCart } from "@/lib/actions/cartServerActions";
// import { createCheckoutSession } from "@/lib/actions/orderServerAction";
// import { toast } from "sonner";

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
// );

// interface CartItem {
//   _id: string;
//   product: {
//     _id: string;
//     name: string;
//     slug: string;
//     price: number;
//     images: string[];
//   };
//   quantity: number;
//   price: number;
// }

// interface CartData {
//   _id: string;
//   items: CartItem[];
// }

// // Payment form component
// function PaymentForm({
//   clientSecret,
//   onSuccess,
//   onError,
//   processing,
//   setProcessing,
// }: {
//   clientSecret: string;
//   onSuccess: () => void;
//   onError: (error: string) => void;
//   processing: boolean;
//   setProcessing: (processing: boolean) => void;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setProcessing(true);

//     const result = await stripe.confirmPayment({
//       elements,
//       redirect: "if_required",
//     });

//     if (result.error) {
//       onError(result.error.message || "Payment failed");
//     } else {
//       onSuccess();
//     }

//     setProcessing(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="p-4 border rounded-xl bg-gray-50">
//         <PaymentElement />
//       </div>

//       <Button
//         type="submit"
//         disabled={!stripe || processing}
//         className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-2xl"
//       >
//         {processing ? (
//           <>
//             <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//             Processing Payment...
//           </>
//         ) : (
//           `Complete Payment`
//         )}
//       </Button>
//     </form>
//   );
// }

// export default function CheckoutPage() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [cart, setCart] = useState<CartData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [orderId, setOrderId] = useState<string | null>(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     apartment: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "US",
//     deliveryMethod: "standard",
//     notes: "",
//     marketingOptIn: false,
//   });

//   const router = useRouter();

//   // Load cart data
//   useEffect(() => {
//     loadCart();
//   }, []);

//   const loadCart = async () => {
//     try {
//       setLoading(true);
//       const result = await getCart();

//       if (result.success && result.cart) {
//         setCart(result.cart);

//         // Redirect to cart if empty
//         if (!result.cart.items || result.cart.items.length === 0) {
//           router.push("/cart");
//           return;
//         }
//       } else {
//         router.push("/cart");
//         return;
//       }
//     } catch (error) {
//       console.error("Error loading cart:", error);
//       toast.error("Failed to load cart");
//       router.push("/cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field: string, value: string | boolean) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const proceedToPayment = async () => {
//     // Validate required fields
//     const requiredFields = ["firstName", "lastName", "email"];
//     if (formData.deliveryMethod !== "pickup") {
//       requiredFields.push("address", "city", "state", "zipCode");
//     }

//     const missingFields = requiredFields.filter(
//       (field) => !formData[field as keyof typeof formData]
//     );

//     if (missingFields.length > 0) {
//       toast.error("Missing Information: Please fill in all required fields");
//       return;
//     }

//     try {
//       setProcessing(true);

//       const checkoutData = {
//         shippingAddress: {
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           address1: formData.address,
//           address2: formData.apartment,
//           city: formData.city,
//           province: formData.state,
//           country: formData.country,
//           zip: formData.zipCode,
//           phone: formData.phone,
//         },
//         email: formData.email,
//         phone: formData.phone,
//         deliveryMethod: formData.deliveryMethod as
//           | "standard"
//           | "express"
//           | "pickup",
//         notes: formData.notes,
//         marketingOptIn: formData.marketingOptIn,
//       };

//       const result = await createCheckoutSession(checkoutData);

//       if (result.success && result.clientSecret) {
//         setClientSecret(result.clientSecret);
//         setOrderId(result.orderId!);
//         setCurrentStep(2);
//       } else {
//         toast.error(result.error || "Failed to create checkout session");
//       }
//     } catch (error) {
//       console.error("Error creating checkout session:", error);
//       toast.error("Failed to proceed to payment");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handlePaymentSuccess = async () => {
//     try {
//       if (!orderId) {
//         throw new Error("No order ID found");
//       }

//       // Show success immediately
//       setOrderComplete(true);
//       setCurrentStep(3);

//       toast.success("Payment Successful! Your order has been confirmed");

//       // Clear cart and redirect after a delay
//       setTimeout(() => {
//         router.push(`/orders/${orderId}`);
//       }, 3000);
//     } catch (error) {
//       console.error("Error handling payment success:", error);
//       toast.error(
//         "Payment processed but there was an issue. Please contact support."
//       );
//     }
//   };

//   const handlePaymentError = (error: string) => {
//     toast.error(
//       <>
//         <b>Payment Failed</b>
//         <div>{error}</div>
//       </>
//     );
//   };

//   // Calculate totals
//   const subtotal =
//     cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
//   const shipping =
//     formData.deliveryMethod === "pickup"
//       ? 0
//       : subtotal >= 25
//         ? 0
//         : formData.deliveryMethod === "express"
//           ? 9.99
//           : 5.99;
//   const tax = Math.round((subtotal + shipping) * 0.08 * 100) / 100;
//   const total = subtotal + shipping + tax;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
//         <div className="text-center space-y-4">
//           <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
//           <p className="text-gray-600">Loading checkout...</p>
//         </div>
//       </div>
//     );
//   }

//   if (orderComplete) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="text-center space-y-6 max-w-md mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-lg"
//         >
//           <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//             <Check className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//             Order Confirmed!
//           </h1>
//           <p className="text-gray-600">
//             Thank you for your purchase. Your order has been confirmed and will
//             be processed shortly.
//           </p>
//           <div className="space-y-3">
//             <Button className="w-full" asChild>
//               <Link href="/orders">View Your Orders</Link>
//             </Button>
//             <Button variant="outline" className="w-full" asChild>
//               <Link href="/shop">Continue Shopping</Link>
//             </Button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <Button variant="ghost" asChild>
//               <Link href="/cart">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 <span className="hidden sm:inline">Back to Cart</span>
//                 <span className="sm:hidden">Cart</span>
//               </Link>
//             </Button>
//             <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//               <span className="hidden sm:inline">Secure Checkout</span>
//               <span className="sm:hidden">Checkout</span>
//             </h1>
//             <div className="flex items-center text-sm text-gray-600">
//               <Lock className="w-4 h-4 mr-1" />
//               Secure
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Progress Indicator */}
//       <div className="container mx-auto px-4 py-4 md:py-6">
//         <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-6 md:mb-8">
//           {[
//             { step: 1, label: "Shipping", icon: Truck },
//             { step: 2, label: "Payment", icon: CreditCard },
//             { step: 3, label: "Complete", icon: Check },
//           ].map(({ step, label, icon: Icon }) => (
//             <div key={step} className="flex items-center">
//               <div
//                 className={`
//                 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all
//                 ${
//                   currentStep >= step
//                     ? "bg-green-600 border-green-600 text-white"
//                     : "border-gray-300 text-gray-400"
//                 }
//               `}
//               >
//                 <Icon className="w-4 h-4 md:w-5 md:h-5" />
//               </div>
//               <span
//                 className={`ml-1 md:ml-2 text-xs md:text-sm font-medium ${
//                   currentStep >= step ? "text-green-600" : "text-gray-400"
//                 }`}
//               >
//                 {label}
//               </span>
//               {step < 3 && (
//                 <div
//                   className={`w-4 md:w-8 h-0.5 ml-2 md:ml-4 ${
//                     currentStep > step ? "bg-green-600" : "bg-gray-300"
//                   }`}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="container mx-auto px-4 pb-8">
//         <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             {currentStep === 1 && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="space-y-4 md:space-y-6"
//               >
//                 {/* Contact Information */}
//                 <Card className="glass border-white/20">
//                   <CardHeader>
//                     <CardTitle className="flex items-center text-lg md:text-xl">
//                       <Mail className="w-5 h-5 mr-2 text-blue-600" />
//                       Contact Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="firstName">First Name *</Label>
//                         <Input
//                           id="firstName"
//                           value={formData.firstName}
//                           onChange={(e) =>
//                             handleInputChange("firstName", e.target.value)
//                           }
//                           className="bg-white/60 border-white/40"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="lastName">Last Name *</Label>
//                         <Input
//                           id="lastName"
//                           value={formData.lastName}
//                           onChange={(e) =>
//                             handleInputChange("lastName", e.target.value)
//                           }
//                           className="bg-white/60 border-white/40"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <Label htmlFor="email">Email Address *</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) =>
//                           handleInputChange("email", e.target.value)
//                         }
//                         className="bg-white/60 border-white/40"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="phone">Phone Number</Label>
//                       <Input
//                         id="phone"
//                         type="tel"
//                         value={formData.phone}
//                         onChange={(e) =>
//                           handleInputChange("phone", e.target.value)
//                         }
//                         className="bg-white/60 border-white/40"
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Delivery Method */}
//                 <Card className="glass border-white/20">
//                   <CardHeader>
//                     <CardTitle className="flex items-center text-lg md:text-xl">
//                       <Truck className="w-5 h-5 mr-2 text-green-600" />
//                       Delivery Method
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <RadioGroup
//                       value={formData.deliveryMethod}
//                       onValueChange={(value) =>
//                         handleInputChange("deliveryMethod", value)
//                       }
//                     >
//                       <div className="space-y-3">
//                         <Label
//                           htmlFor="standard"
//                           className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-center space-x-3">
//                             <RadioGroupItem value="standard" id="standard" />
//                             <div className="flex items-center">
//                               <Truck className="w-5 h-5 mr-2 text-blue-600" />
//                               <div>
//                                 <div className="font-medium text-sm md:text-base">
//                                   Standard Delivery
//                                 </div>
//                                 <div className="text-xs md:text-sm text-gray-500">
//                                   5-7 business days
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <Badge
//                             variant="secondary"
//                             className="bg-green-100 text-green-700"
//                           >
//                             {subtotal >= 25 ? "FREE" : "$5.99"}
//                           </Badge>
//                         </Label>

//                         <Label
//                           htmlFor="express"
//                           className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-center space-x-3">
//                             <RadioGroupItem value="express" id="express" />
//                             <div className="flex items-center">
//                               <Zap className="w-5 h-5 mr-2 text-amber-600" />
//                               <div>
//                                 <div className="font-medium text-sm md:text-base">
//                                   Express Delivery
//                                 </div>
//                                 <div className="text-xs md:text-sm text-gray-500">
//                                   2-3 business days
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <Badge variant="outline">$9.99</Badge>
//                         </Label>

//                         <Label
//                           htmlFor="pickup"
//                           className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
//                         >
//                           <div className="flex items-center space-x-3">
//                             <RadioGroupItem value="pickup" id="pickup" />
//                             <div className="flex items-center">
//                               <Store className="w-5 h-5 mr-2 text-green-600" />
//                               <div>
//                                 <div className="font-medium text-sm md:text-base">
//                                   Store Pickup
//                                 </div>
//                                 <div className="text-xs md:text-sm text-gray-500">
//                                   Available same day
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                           <Badge
//                             variant="secondary"
//                             className="bg-green-100 text-green-700"
//                           >
//                             FREE
//                           </Badge>
//                         </Label>
//                       </div>
//                     </RadioGroup>
//                   </CardContent>
//                 </Card>

//                 {/* Shipping Address */}
//                 {formData.deliveryMethod !== "pickup" && (
//                   <Card className="glass border-white/20">
//                     <CardHeader>
//                       <CardTitle className="flex items-center text-lg md:text-xl">
//                         <MapPin className="w-5 h-5 mr-2 text-red-600" />
//                         Shipping Address
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div>
//                         <Label htmlFor="address">Street Address *</Label>
//                         <Input
//                           id="address"
//                           value={formData.address}
//                           onChange={(e) =>
//                             handleInputChange("address", e.target.value)
//                           }
//                           className="bg-white/60 border-white/40"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="apartment">
//                           Apartment, Suite, etc.
//                         </Label>
//                         <Input
//                           id="apartment"
//                           value={formData.apartment}
//                           onChange={(e) =>
//                             handleInputChange("apartment", e.target.value)
//                           }
//                           className="bg-white/60 border-white/40"
//                         />
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <Label htmlFor="city">City *</Label>
//                           <Input
//                             id="city"
//                             value={formData.city}
//                             onChange={(e) =>
//                               handleInputChange("city", e.target.value)
//                             }
//                             className="bg-white/60 border-white/40"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="state">State *</Label>
//                           <Select
//                             value={formData.state}
//                             onValueChange={(value) =>
//                               handleInputChange("state", value)
//                             }
//                           >
//                             <SelectTrigger className="bg-white/60 border-white/40">
//                               <SelectValue placeholder="Select state" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="AL">Alabama</SelectItem>
//                               <SelectItem value="CA">California</SelectItem>
//                               <SelectItem value="FL">Florida</SelectItem>
//                               <SelectItem value="NY">New York</SelectItem>
//                               <SelectItem value="TX">Texas</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div>
//                           <Label htmlFor="zipCode">ZIP Code *</Label>
//                           <Input
//                             id="zipCode"
//                             value={formData.zipCode}
//                             onChange={(e) =>
//                               handleInputChange("zipCode", e.target.value)
//                             }
//                             className="bg-white/60 border-white/40"
//                             required
//                           />
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 {/* Additional Options */}
//                 <Card className="glass border-white/20">
//                   <CardContent className="pt-6 space-y-4">
//                     <div>
//                       <Label htmlFor="notes">Order Notes (Optional)</Label>
//                       <Input
//                         id="notes"
//                         value={formData.notes}
//                         onChange={(e) =>
//                           handleInputChange("notes", e.target.value)
//                         }
//                         className="bg-white/60 border-white/40"
//                         placeholder="Special delivery instructions..."
//                       />
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id="marketing"
//                         checked={formData.marketingOptIn}
//                         onCheckedChange={(checked) =>
//                           handleInputChange("marketingOptIn", checked === true)
//                         }
//                       />
//                       <Label htmlFor="marketing" className="text-sm">
//                         Send me special offers and wellness tips
//                       </Label>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <div className="flex justify-end">
//                   <Button
//                     onClick={proceedToPayment}
//                     disabled={processing}
//                     className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 rounded-2xl"
//                   >
//                     {processing ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Processing...
//                       </>
//                     ) : (
//                       "Continue to Payment"
//                     )}
//                   </Button>
//                 </div>
//               </motion.div>
//             )}

//             {currentStep === 2 && clientSecret && (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="space-y-4 md:space-y-6"
//               >
//                 <Card className="glass border-white/20">
//                   <CardHeader>
//                     <CardTitle className="flex items-center text-lg md:text-xl">
//                       <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
//                       Payment Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <Elements
//                       stripe={stripePromise}
//                       options={{
//                         clientSecret,
//                         appearance: {
//                           theme: "stripe",
//                           variables: {
//                             colorPrimary: "#16a34a",
//                           },
//                         },
//                       }}
//                     >
//                       <PaymentForm
//                         clientSecret={clientSecret}
//                         onSuccess={handlePaymentSuccess}
//                         onError={handlePaymentError}
//                         processing={processing}
//                         setProcessing={setProcessing}
//                       />
//                     </Elements>
//                   </CardContent>
//                 </Card>

//                 <div className="flex justify-between">
//                   <Button
//                     variant="outline"
//                     onClick={() => setCurrentStep(1)}
//                     className="px-6 md:px-8 py-3 rounded-2xl"
//                   >
//                     Back to Shipping
//                   </Button>
//                 </div>
//               </motion.div>
//             )}
//           </div>

//           {/* Order Summary Sidebar */}
//           <div className="lg:col-span-1">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
//             >
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <Gift className="w-5 h-5 mr-2 text-purple-600" />
//                 Order Summary
//               </h3>

//               {/* Order Items */}
//               <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
//                 {cart?.items.map((item) => (
//                   <div key={item._id} className="flex items-center gap-3">
//                     <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
//                       <Image
//                         src={
//                           item.product.images[0] || "/api/placeholder/300/300"
//                         }
//                         alt={item.product.name}
//                         fill
//                         className="object-cover"
//                       />
//                       <Badge
//                         variant="secondary"
//                         className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full p-0 flex items-center justify-center text-xs"
//                       >
//                         {item.quantity}
//                       </Badge>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-xs md:text-sm truncate">
//                         {item.product.name}
//                       </h4>
//                       <p className="text-xs text-gray-500">
//                         ${item.price.toFixed(2)} each
//                       </p>
//                     </div>
//                     <div className="text-sm font-medium">
//                       ${(item.quantity * item.price).toFixed(2)}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <Separator className="mb-4" />

//               {/* Pricing Breakdown */}
//               <div className="space-y-2 mb-4 md:mb-6">
//                 <div className="flex justify-between text-sm">
//                   <span>Subtotal</span>
//                   <span>${subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span>Shipping</span>
//                   <span className="text-green-600">
//                     {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span>Tax</span>
//                   <span>${tax.toFixed(2)}</span>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between font-bold text-lg">
//                   <span>Total</span>
//                   <span className="text-green-600">${total.toFixed(2)}</span>
//                 </div>
//               </div>

//               {/* Security Badges */}
//               <div className="text-center space-y-2">
//                 <div className="flex items-center justify-center text-xs text-gray-500">
//                   <Shield className="w-4 h-4 mr-1" />
//                   256-bit SSL encrypted
//                 </div>
//                 <div className="flex items-center justify-center text-xs text-gray-500">
//                   <Lock className="w-4 h-4 mr-1" />
//                   PCI DSS compliant
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Bottom Navigation Spacer */}
//       <div className="h-20 md:hidden" />
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";

import {
  ArrowLeft,
  Shield,
  CreditCard,
  Truck,
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  Building,
  Check,
  Lock,
  Zap,
  Gift,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getCart } from "@/lib/actions/cartServerActions";
import {
  createCheckoutSession,
  confirmPayment,
} from "@/lib/actions/orderServerAction";
import StripeShopCheckout from "@/components/shop/StripeShopCheckout";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
}

interface CartData {
  _id: string;
  items: CartItem[];
}

// Payment form component
// function PaymentForm({
//   clientSecret,
//   onSuccess,
//   onError,
//   processing,
//   setProcessing,
// }: {
//   clientSecret: string;
//   onSuccess: () => void;
//   onError: (error: string) => void;
//   processing: boolean;
//   setProcessing: (processing: boolean) => void;
// }) {
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setProcessing(true);

//     const result = await stripe.confirmPayment({
//       elements,
//       redirect: "if_required",
//     });

//     if (result.error) {
//       onError(result.error.message || "Payment failed");
//     } else {
//       onSuccess();
//     }

//     setProcessing(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="p-4 border rounded-xl bg-gray-50">
//         <PaymentElement />
//       </div>

//       <Button
//         type="submit"
//         disabled={!stripe || processing}
//         className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-2xl"
//       >
//         {processing ? (
//           <>
//             <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//             Processing Payment...
//           </>
//         ) : (
//           `Complete Payment`
//         )}
//       </Button>
//     </form>
//   );
// }

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    deliveryMethod: "standard",
    notes: "",
    marketingOptIn: false,
  });

  const router = useRouter();

  // Load cart data
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const result = await getCart();

      if (result.success && result.cart) {
        setCart(result.cart);

        // Redirect to cart if empty
        if (!result.cart.items || result.cart.items.length === 0) {
          router.push("/cart");
          return;
        }
      } else {
        router.push("/cart");
        return;
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Failed to load cart");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const proceedToPayment = async () => {
    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email"];
    if (formData.deliveryMethod !== "pickup") {
      requiredFields.push("address", "city", "state", "zipCode");
    }

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setProcessing(true);

      const checkoutData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address,
          address2: formData.apartment,
          city: formData.city,
          province: formData.state,
          country: formData.country,
          zip: formData.zipCode,
          phone: formData.phone,
        },
        email: formData.email,
        phone: formData.phone,
        deliveryMethod: formData.deliveryMethod as
          | "standard"
          | "express"
          | "pickup",
        notes: formData.notes,
        marketingOptIn: formData.marketingOptIn,
      };

      const result = await createCheckoutSession(checkoutData);

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setOrderId(result.orderId!);
        setCurrentStep(2);
      } else {
        toast.error(result.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to proceed to payment");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (!orderId) {
        throw new Error("No order ID found");
      }

      // Show success immediately
      setOrderComplete(true);
      setCurrentStep(3);

      toast.success("Payment successful! Your order has been confirmed");

      // Clear cart and redirect after a delay
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 3000);
    } catch (error) {
      console.error("Error handling payment success:", error);
      toast.error(
        "Payment processed but there was an issue. Please contact support."
      );
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment Failed: ${error}`);
  };

  // Calculate totals
  const subtotal =
    cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
  const shipping =
    formData.deliveryMethod === "pickup"
      ? 0
      : subtotal >= 25
        ? 0
        : formData.deliveryMethod === "express"
          ? 9.99
          : 5.99;
  const tax = Math.round((subtotal + shipping) * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-lg"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed and will
            be processed shortly.
          </p>
          <div className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/orders">View Your Orders</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Cart</span>
                <span className="sm:hidden">Cart</span>
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Secure Checkout</span>
              <span className="sm:hidden">Checkout</span>
            </h1>
            <div className="flex items-center text-sm text-gray-600">
              <Lock className="w-4 h-4 mr-1" />
              Secure
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 md:space-y-6"
              >
                {/* Contact Information */}
                <Card className="glass border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/60 border-white/40"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="bg-white/60 border-white/40"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Method */}
                <Card className="glass border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <Truck className="w-5 h-5 mr-2 text-green-600" />
                      Delivery Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.deliveryMethod}
                      onValueChange={(value) =>
                        handleInputChange("deliveryMethod", value)
                      }
                    >
                      <div className="space-y-3">
                        <Label
                          htmlFor="standard"
                          className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <div className="flex items-center">
                              <Truck className="w-5 h-5 mr-2 text-blue-600" />
                              <div>
                                <div className="font-medium text-sm md:text-base">
                                  Standard Delivery
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  5-7 business days
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            {subtotal >= 25 ? "FREE" : "$5.99"}
                          </Badge>
                        </Label>

                        <Label
                          htmlFor="express"
                          className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="express" id="express" />
                            <div className="flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-amber-600" />
                              <div>
                                <div className="font-medium text-sm md:text-base">
                                  Express Delivery
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  2-3 business days
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">$9.99</Badge>
                        </Label>

                        <Label
                          htmlFor="pickup"
                          className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <div className="flex items-center">
                              <Store className="w-5 h-5 mr-2 text-green-600" />
                              <div>
                                <div className="font-medium text-sm md:text-base">
                                  Store Pickup
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  Available same day
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700"
                          >
                            FREE
                          </Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                {formData.deliveryMethod !== "pickup" && (
                  <Card className="glass border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg md:text-xl">
                        <MapPin className="w-5 h-5 mr-2 text-red-600" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apartment">
                          Apartment, Suite, etc.
                        </Label>
                        <Input
                          id="apartment"
                          value={formData.apartment}
                          onChange={(e) =>
                            handleInputChange("apartment", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="bg-white/60 border-white/40"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) =>
                              handleInputChange("state", value)
                            }
                          >
                            <SelectTrigger className="bg-white/60 border-white/40">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AL">Alabama</SelectItem>
                              <SelectItem value="CA">California</SelectItem>
                              <SelectItem value="FL">Florida</SelectItem>
                              <SelectItem value="NY">New York</SelectItem>
                              <SelectItem value="TX">Texas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) =>
                              handleInputChange("zipCode", e.target.value)
                            }
                            className="bg-white/60 border-white/40"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Options */}
                <Card className="glass border-white/20">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        className="bg-white/60 border-white/40"
                        placeholder="Special delivery instructions..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={formData.marketingOptIn}
                        onCheckedChange={(checked) =>
                          handleInputChange("marketingOptIn", checked === true)
                        }
                      />
                      <Label htmlFor="marketing" className="text-sm">
                        Send me special offers and wellness tips
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={proceedToPayment}
                    disabled={processing}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 rounded-2xl"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && clientSecret && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 md:space-y-6"
              >
                <Card className="glass border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 md:px-8 py-3 rounded-2xl"
                  >
                    Back to Shipping
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-600" />
                Order Summary
              </h3>

              {/* Order Items */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                {cart?.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.product.images[0] || "/api/placeholder/300/300"
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs md:text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-4 md:mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: clientSecret, // ← Stripe Elements needs this
                    appearance: { theme: "stripe" },
                  }}
                >
                  <StripeShopCheckout
                    amount={total}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div>Loading payment...</div>
              )}
              {/* Security Badges */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Shield className="w-4 h-4 mr-1" />
                  256-bit SSL encrypted
                </div>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Lock className="w-4 h-4 mr-1" />
                  PCI DSS compliant
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
