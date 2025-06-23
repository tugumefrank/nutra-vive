// // "use client";

// // import { useState, useEffect } from "react";
// // import { motion } from "framer-motion";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { useRouter } from "next/navigation";
// // import { loadStripe } from "@stripe/stripe-js";
// // import { Elements } from "@stripe/react-stripe-js";

// // import {
// //   ArrowLeft,
// //   Shield,
// //   CreditCard,
// //   Truck,
// //   Store,
// //   MapPin,
// //   Check,
// //   Lock,
// //   Zap,
// //   Gift,
// //   Loader2,
// //   AlertCircle,
// //   Mail,
// // } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Checkbox } from "@/components/ui/checkbox";
// // import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import { toast } from "sonner";
// // import { getCart } from "@/lib/actions/cartServerActions";
// // import {
// //   createCheckoutSession,
// //   confirmPayment,
// // } from "@/lib/actions/orderServerActions";
// // import StripeShopCheckout from "@/components/shop/StripeShopCheckout";

// // // Initialize Stripe outside component to avoid recreating
// // const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// // interface CartItem {
// //   _id: string;
// //   product: {
// //     _id: string;
// //     name: string;
// //     slug: string;
// //     price: number;
// //     images: string[];
// //   };
// //   quantity: number;
// //   price: number;
// // }

// // interface CartData {
// //   _id: string;
// //   items: CartItem[];
// // }

// // export default function CheckoutPage() {
// //   const [cart, setCart] = useState<CartData | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [orderComplete, setOrderComplete] = useState(false);
// //   const [clientSecret, setClientSecret] = useState<string | null>(null);
// //   const [orderId, setOrderId] = useState<string | null>(null);
// //   const [paymentLoading, setPaymentLoading] = useState(false);
// //   const [formValid, setFormValid] = useState(false);
// //   const [paymentError, setPaymentError] = useState<string | null>(null);
// //   const [creatingOrder, setCreatingOrder] = useState(false);

// //   // Form state
// //   const [formData, setFormData] = useState({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     phone: "",
// //     address: "",
// //     apartment: "",
// //     city: "",
// //     state: "",
// //     zipCode: "",
// //     country: "US",
// //     deliveryMethod: "standard",
// //     notes: "",
// //     marketingOptIn: false,
// //   });

// //   const router = useRouter();

// //   // Calculate totals
// //   const subtotal =
// //     cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
// //   const shipping: number =
// //     formData.deliveryMethod === "pickup"
// //       ? 0
// //       : subtotal >= 25
// //         ? 0
// //         : formData.deliveryMethod === "express"
// //           ? 0
// //           : 0;
// //   const tax = 0; //Math.round((subtotal + shipping) * 0.08 * 100) / 100;
// //   const total = subtotal + shipping + tax;

// //   // Load cart data
// //   useEffect(() => {
// //     loadCart();
// //   }, []);

// //   // Validate form whenever formData changes
// //   useEffect(() => {
// //     validateForm();
// //   }, [formData]);

// //   // Create order and payment intent when form is valid and total > 0
// //   useEffect(() => {
// //     if (
// //       formValid &&
// //       total > 0 &&
// //       !clientSecret &&
// //       !paymentLoading &&
// //       !creatingOrder
// //     ) {
// //       console.log("Conditions met for order creation:", {
// //         formValid,
// //         total,
// //         clientSecret: !!clientSecret,
// //         paymentLoading,
// //         creatingOrder,
// //       });
// //       createOrder();
// //     }
// //   }, [formValid, total, clientSecret, paymentLoading, creatingOrder]);

// //   const loadCart = async () => {
// //     try {
// //       setLoading(true);
// //       const result = await getCart();

// //       if (result.success && result.cart) {
// //         setCart(result.cart);
// //         console.log("Cart loaded:", result.cart);

// //         // Redirect to cart if empty
// //         if (!result.cart.items || result.cart.items.length === 0) {
// //           router.push("/cart");
// //           return;
// //         }
// //       } else {
// //         router.push("/cart");
// //         return;
// //       }
// //     } catch (error) {
// //       console.error("Error loading cart:", error);
// //       toast.error("Failed to load cart");
// //       router.push("/cart");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleInputChange = (field: string, value: string | boolean) => {
// //     setFormData((prev) => ({ ...prev, [field]: value }));

// //     // Reset payment state when form changes to trigger re-creation
// //     if (clientSecret) {
// //       setClientSecret(null);
// //       setOrderId(null);
// //       setPaymentError(null);
// //     }
// //   };

// //   const validateForm = () => {
// //     const requiredFields = ["firstName", "lastName", "email"];
// //     if (formData.deliveryMethod !== "pickup") {
// //       requiredFields.push("address", "city", "state", "zipCode");
// //     }

// //     const isValid = requiredFields.every((field) => {
// //       const value = formData[field as keyof typeof formData];
// //       return value && value.toString().trim() !== "";
// //     });

// //     // Validate email format
// //     const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

// //     console.log("Form validation:", {
// //       isValid: isValid && emailValid,
// //       requiredFields,
// //       formData,
// //     });
// //     setFormValid(isValid && emailValid);
// //   };

// //   const createOrder = async () => {
// //     try {
// //       console.log("Creating order and payment intent for total:", total);
// //       setCreatingOrder(true);
// //       setPaymentError(null);

// //       // Prepare checkout data according to your schema
// //       const checkoutData = {
// //         shippingAddress: {
// //           firstName: formData.firstName,
// //           lastName: formData.lastName,
// //           address1: formData.address,
// //           address2: formData.apartment,
// //           city: formData.city,
// //           province: formData.state,
// //           country: formData.country,
// //           zip: formData.zipCode,
// //           phone: formData.phone,
// //         },
// //         billingAddress: undefined, // Will use shipping address
// //         email: formData.email,
// //         phone: formData.phone,
// //         deliveryMethod: formData.deliveryMethod as
// //           | "standard"
// //           | "express"
// //           | "pickup",
// //         notes: formData.notes,
// //         marketingOptIn: formData.marketingOptIn,
// //       };

// //       console.log("Calling createCheckoutSession with data:", checkoutData);
// //       const result = await createCheckoutSession(checkoutData);
// //       console.log("Checkout session result:", result);

// //       if (result.success && result.clientSecret && result.orderId) {
// //         console.log("Order created successfully:", {
// //           orderId: result.orderId,
// //           clientSecret: result.clientSecret.substring(0, 20) + "...",
// //         });

// //         setOrderId(result.orderId);
// //         setClientSecret(result.clientSecret);

// //         toast.success("Order created! Complete payment to confirm.");
// //       } else {
// //         console.error("Checkout session creation failed:", result.error);
// //         setPaymentError(result.error || "Failed to create order");
// //         toast.error(result.error || "Failed to create order");
// //       }
// //     } catch (error) {
// //       console.error("Error creating order:", error);
// //       const errorMessage =
// //         error instanceof Error ? error.message : "Failed to create order";
// //       setPaymentError(errorMessage);
// //       toast.error(errorMessage);
// //     } finally {
// //       setCreatingOrder(false);
// //     }
// //   };

// //   const handlePaymentSuccess = async (paymentIntentId: string) => {
// //     try {
// //       console.log("Payment successful, confirming order...", paymentIntentId);

// //       // Confirm the payment and update order status
// //       const result = await confirmPayment(paymentIntentId);

// //       if (result.success && result.order) {
// //         console.log("Order confirmed:", result.order);
// //         setOrderComplete(true);

// //         toast.success(
// //           "Order placed successfully! You will receive a confirmation email shortly."
// //         );

// //         // Redirect to order details after 3 seconds
// //         setTimeout(() => {
// //           router.push(`/orders/${result.order._id}`);
// //         }, 3000);
// //       } else {
// //         console.error("Order confirmation failed:", result.error);
// //         toast.error(
// //           result.error ||
// //             "Payment processed but there was an issue confirming your order. Please contact support."
// //         );
// //       }
// //     } catch (error) {
// //       console.error("Error handling payment success:", error);
// //       toast.error(
// //         "Payment processed but there was an issue confirming your order. Please contact support."
// //       );
// //     }
// //   };

// //   const handlePaymentError = (error: string) => {
// //     console.error("Payment error:", error);
// //     setPaymentError(error);
// //     toast.error("Payment failed: " + error);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
// //         <div className="text-center space-y-4">
// //           <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
// //           <p className="text-gray-600">Loading checkout...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (orderComplete) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
// //         <motion.div
// //           initial={{ opacity: 0, scale: 0.8 }}
// //           animate={{ opacity: 1, scale: 1 }}
// //           className="text-center space-y-6 max-w-md mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-lg"
// //         >
// //           <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
// //             <Check className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
// //           </div>
// //           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
// //             Order Confirmed!
// //           </h1>
// //           <p className="text-gray-600">
// //             Thank you for your purchase. Your order has been confirmed and will
// //             be processed shortly.
// //           </p>
// //           {orderId && (
// //             <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
// //               <p className="text-sm text-green-700">
// //                 Order ID: <span className="font-mono font-bold">{orderId}</span>
// //               </p>
// //             </div>
// //           )}
// //           <div className="space-y-3">
// //             <Button className="w-full" asChild>
// //               <Link href="/orders">View Your Orders</Link>
// //             </Button>
// //             <Button variant="outline" className="w-full" asChild>
// //               <Link href="/shop">Continue Shopping</Link>
// //             </Button>
// //           </div>
// //         </motion.div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
// //       {/* Header */}
// //       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100">
// //         <div className="container mx-auto px-4 py-4">
// //           <div className="flex items-center justify-between">
// //             <Button variant="ghost" asChild>
// //               <Link href="/cart">
// //                 <ArrowLeft className="w-4 h-4 mr-2" />
// //                 <span className="hidden sm:inline">Back to Cart</span>
// //                 <span className="sm:hidden">Cart</span>
// //               </Link>
// //             </Button>
// //             <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
// //               <span className="hidden sm:inline">Secure Checkout</span>
// //               <span className="sm:hidden">Checkout</span>
// //             </h1>
// //             <div className="flex items-center text-sm text-gray-600">
// //               <Lock className="w-4 h-4 mr-1" />
// //               Secure
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="container mx-auto px-4 pb-8">
// //         <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
// //           {/* Main Content - Shipping Information */}
// //           <div className="lg:col-span-2">
// //             <motion.div
// //               initial={{ opacity: 0, x: -20 }}
// //               animate={{ opacity: 1, x: 0 }}
// //               className="space-y-4 md:space-y-6"
// //             >
// //               {/* Contact Information */}
// //               <Card className="glass border-white/20">
// //                 <CardHeader>
// //                   <CardTitle className="flex items-center text-lg md:text-xl">
// //                     <Mail className="w-5 h-5 mr-2 text-blue-600" />
// //                     Contact Information
// //                   </CardTitle>
// //                 </CardHeader>
// //                 <CardContent className="space-y-4">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <Label htmlFor="firstName">First Name *</Label>
// //                       <Input
// //                         id="firstName"
// //                         value={formData.firstName}
// //                         onChange={(e) =>
// //                           handleInputChange("firstName", e.target.value)
// //                         }
// //                         className="bg-white/60 border-white/40"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <Label htmlFor="lastName">Last Name *</Label>
// //                       <Input
// //                         id="lastName"
// //                         value={formData.lastName}
// //                         onChange={(e) =>
// //                           handleInputChange("lastName", e.target.value)
// //                         }
// //                         className="bg-white/60 border-white/40"
// //                         required
// //                       />
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <Label htmlFor="email">Email Address *</Label>
// //                     <Input
// //                       id="email"
// //                       type="email"
// //                       value={formData.email}
// //                       onChange={(e) =>
// //                         handleInputChange("email", e.target.value)
// //                       }
// //                       className="bg-white/60 border-white/40"
// //                       required
// //                     />
// //                   </div>
// //                   <div>
// //                     <Label htmlFor="phone">Phone Number</Label>
// //                     <Input
// //                       id="phone"
// //                       type="tel"
// //                       value={formData.phone}
// //                       onChange={(e) =>
// //                         handleInputChange("phone", e.target.value)
// //                       }
// //                       className="bg-white/60 border-white/40"
// //                     />
// //                   </div>
// //                 </CardContent>
// //               </Card>

// //               {/* Delivery Method */}
// //               <Card className="glass border-white/20">
// //                 <CardHeader>
// //                   <CardTitle className="flex items-center text-lg md:text-xl">
// //                     <Truck className="w-5 h-5 mr-2 text-green-600" />
// //                     Delivery Method
// //                   </CardTitle>
// //                 </CardHeader>
// //                 <CardContent>
// //                   <RadioGroup
// //                     value={formData.deliveryMethod}
// //                     onValueChange={(value) =>
// //                       handleInputChange("deliveryMethod", value)
// //                     }
// //                   >
// //                     <div className="space-y-3">
// //                       <Label
// //                         htmlFor="standard"
// //                         className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
// //                       >
// //                         <div className="flex items-center space-x-3">
// //                           <RadioGroupItem value="standard" id="standard" />
// //                           <div className="flex items-center">
// //                             <Truck className="w-5 h-5 mr-2 text-blue-600" />
// //                             <div>
// //                               <div className="font-medium text-sm md:text-base">
// //                                 Standard Delivery
// //                               </div>
// //                               <div className="text-xs md:text-sm text-gray-500">
// //                                 5-7 business days
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </div>
// //                         <Badge
// //                           variant="secondary"
// //                           className="bg-green-100 text-green-700"
// //                         >
// //                           {subtotal >= 25 ? "FREE" : "$0.00"}
// //                         </Badge>
// //                       </Label>

// //                       <Label
// //                         htmlFor="express"
// //                         className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
// //                       >
// //                         <div className="flex items-center space-x-3">
// //                           <RadioGroupItem value="express" id="express" />
// //                           <div className="flex items-center">
// //                             <Zap className="w-5 h-5 mr-2 text-amber-600" />
// //                             <div>
// //                               <div className="font-medium text-sm md:text-base">
// //                                 Express Delivery
// //                               </div>
// //                               <div className="text-xs md:text-sm text-gray-500">
// //                                 2-3 business days
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </div>
// //                         <Badge variant="outline">$0.00</Badge>
// //                       </Label>

// //                       <Label
// //                         htmlFor="pickup"
// //                         className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
// //                       >
// //                         <div className="flex items-center space-x-3">
// //                           <RadioGroupItem value="pickup" id="pickup" />
// //                           <div className="flex items-center">
// //                             <Store className="w-5 h-5 mr-2 text-green-600" />
// //                             <div>
// //                               <div className="font-medium text-sm md:text-base">
// //                                 Store Pickup
// //                               </div>
// //                               <div className="text-xs md:text-sm text-gray-500">
// //                                 Available same day
// //                               </div>
// //                             </div>
// //                           </div>
// //                         </div>
// //                         <Badge
// //                           variant="secondary"
// //                           className="bg-green-100 text-green-700"
// //                         >
// //                           FREE
// //                         </Badge>
// //                       </Label>
// //                     </div>
// //                   </RadioGroup>
// //                 </CardContent>
// //               </Card>

// //               {/* Shipping Address */}
// //               {formData.deliveryMethod !== "pickup" && (
// //                 <Card className="glass border-white/20">
// //                   <CardHeader>
// //                     <CardTitle className="flex items-center text-lg md:text-xl">
// //                       <MapPin className="w-5 h-5 mr-2 text-red-600" />
// //                       Shipping Address
// //                     </CardTitle>
// //                   </CardHeader>
// //                   <CardContent className="space-y-4">
// //                     <div>
// //                       <Label htmlFor="address">Street Address *</Label>
// //                       <Input
// //                         id="address"
// //                         value={formData.address}
// //                         onChange={(e) =>
// //                           handleInputChange("address", e.target.value)
// //                         }
// //                         className="bg-white/60 border-white/40"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <Label htmlFor="apartment">Apartment, Suite, etc.</Label>
// //                       <Input
// //                         id="apartment"
// //                         value={formData.apartment}
// //                         onChange={(e) =>
// //                           handleInputChange("apartment", e.target.value)
// //                         }
// //                         className="bg-white/60 border-white/40"
// //                       />
// //                     </div>
// //                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                       <div>
// //                         <Label htmlFor="city">City *</Label>
// //                         <Input
// //                           id="city"
// //                           value={formData.city}
// //                           onChange={(e) =>
// //                             handleInputChange("city", e.target.value)
// //                           }
// //                           className="bg-white/60 border-white/40"
// //                           required
// //                         />
// //                       </div>
// //                       <div>
// //                         <Label htmlFor="state">State *</Label>
// //                         <Select
// //                           value={formData.state}
// //                           onValueChange={(value) =>
// //                             handleInputChange("state", value)
// //                           }
// //                         >
// //                           <SelectTrigger className="bg-white/60 border-white/40">
// //                             <SelectValue placeholder="Select state" />
// //                           </SelectTrigger>
// //                           <SelectContent>
// //                             <SelectItem value="AL">Alabama</SelectItem>
// //                             <SelectItem value="AK">Alaska</SelectItem>
// //                             <SelectItem value="AZ">Arizona</SelectItem>
// //                             <SelectItem value="AR">Arkansas</SelectItem>
// //                             <SelectItem value="CA">California</SelectItem>
// //                             <SelectItem value="CO">Colorado</SelectItem>
// //                             <SelectItem value="CT">Connecticut</SelectItem>
// //                             <SelectItem value="DE">Delaware</SelectItem>
// //                             <SelectItem value="FL">Florida</SelectItem>
// //                             <SelectItem value="GA">Georgia</SelectItem>
// //                             <SelectItem value="HI">Hawaii</SelectItem>
// //                             <SelectItem value="ID">Idaho</SelectItem>
// //                             <SelectItem value="IL">Illinois</SelectItem>
// //                             <SelectItem value="IN">Indiana</SelectItem>
// //                             <SelectItem value="IA">Iowa</SelectItem>
// //                             <SelectItem value="KS">Kansas</SelectItem>
// //                             <SelectItem value="KY">Kentucky</SelectItem>
// //                             <SelectItem value="LA">Louisiana</SelectItem>
// //                             <SelectItem value="ME">Maine</SelectItem>
// //                             <SelectItem value="MD">Maryland</SelectItem>
// //                             <SelectItem value="MA">Massachusetts</SelectItem>
// //                             <SelectItem value="MI">Michigan</SelectItem>
// //                             <SelectItem value="MN">Minnesota</SelectItem>
// //                             <SelectItem value="MS">Mississippi</SelectItem>
// //                             <SelectItem value="MO">Missouri</SelectItem>
// //                             <SelectItem value="MT">Montana</SelectItem>
// //                             <SelectItem value="NE">Nebraska</SelectItem>
// //                             <SelectItem value="NV">Nevada</SelectItem>
// //                             <SelectItem value="NH">New Hampshire</SelectItem>
// //                             <SelectItem value="NJ">New Jersey</SelectItem>
// //                             <SelectItem value="NM">New Mexico</SelectItem>
// //                             <SelectItem value="NY">New York</SelectItem>
// //                             <SelectItem value="NC">North Carolina</SelectItem>
// //                             <SelectItem value="ND">North Dakota</SelectItem>
// //                             <SelectItem value="OH">Ohio</SelectItem>
// //                             <SelectItem value="OK">Oklahoma</SelectItem>
// //                             <SelectItem value="OR">Oregon</SelectItem>
// //                             <SelectItem value="PA">Pennsylvania</SelectItem>
// //                             <SelectItem value="RI">Rhode Island</SelectItem>
// //                             <SelectItem value="SC">South Carolina</SelectItem>
// //                             <SelectItem value="SD">South Dakota</SelectItem>
// //                             <SelectItem value="TN">Tennessee</SelectItem>
// //                             <SelectItem value="TX">Texas</SelectItem>
// //                             <SelectItem value="UT">Utah</SelectItem>
// //                             <SelectItem value="VT">Vermont</SelectItem>
// //                             <SelectItem value="VA">Virginia</SelectItem>
// //                             <SelectItem value="WA">Washington</SelectItem>
// //                             <SelectItem value="WV">West Virginia</SelectItem>
// //                             <SelectItem value="WI">Wisconsin</SelectItem>
// //                             <SelectItem value="WY">Wyoming</SelectItem>
// //                           </SelectContent>
// //                         </Select>
// //                       </div>
// //                       <div>
// //                         <Label htmlFor="zipCode">ZIP Code *</Label>
// //                         <Input
// //                           id="zipCode"
// //                           value={formData.zipCode}
// //                           onChange={(e) =>
// //                             handleInputChange("zipCode", e.target.value)
// //                           }
// //                           className="bg-white/60 border-white/40"
// //                           required
// //                         />
// //                       </div>
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               )}

// //               {/* Additional Options */}
// //               <Card className="glass border-white/20">
// //                 <CardContent className="pt-6 space-y-4">
// //                   <div>
// //                     <Label htmlFor="notes">Order Notes (Optional)</Label>
// //                     <Input
// //                       id="notes"
// //                       value={formData.notes}
// //                       onChange={(e) =>
// //                         handleInputChange("notes", e.target.value)
// //                       }
// //                       className="bg-white/60 border-white/40"
// //                       placeholder="Special delivery instructions..."
// //                     />
// //                   </div>
// //                   <div className="flex items-center space-x-2">
// //                     <Checkbox
// //                       id="marketing"
// //                       checked={formData.marketingOptIn}
// //                       onCheckedChange={(checked) =>
// //                         handleInputChange("marketingOptIn", checked === true)
// //                       }
// //                     />
// //                     <Label htmlFor="marketing" className="text-sm">
// //                       Send me special offers and wellness tips
// //                     </Label>
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             </motion.div>
// //           </div>

// //           {/* Order Summary Sidebar with Payment */}
// //           <div className="lg:col-span-1">
// //             <motion.div
// //               initial={{ opacity: 0, y: 20 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 bg-white border border-white/20 sticky top-24"
// //             >
// //               <h3 className="text-lg font-semibold mb-4 flex items-center">
// //                 <Gift className="w-5 h-5 mr-2 text-purple-600" />
// //                 Order Summary
// //               </h3>

// //               {/* Order Items */}
// //               <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
// //                 {cart?.items.map((item) => (
// //                   <div key={item._id} className="flex items-center gap-3">
// //                     <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0">
// //                       <Image
// //                         src={
// //                           item.product.images[0] || "/api/placeholder/300/300"
// //                         }
// //                         alt={item.product.name}
// //                         fill
// //                         className="object-cover"
// //                       />
// //                       <Badge
// //                         variant="secondary"
// //                         className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full p-0 flex items-center justify-center text-xs"
// //                       >
// //                         {item.quantity}
// //                       </Badge>
// //                     </div>
// //                     <div className="flex-1 min-w-0">
// //                       <h4 className="font-medium text-xs md:text-sm truncate">
// //                         {item.product.name}
// //                       </h4>
// //                       <p className="text-xs text-gray-500">
// //                         ${item.price.toFixed(2)} each
// //                       </p>
// //                     </div>
// //                     <div className="text-sm font-medium">
// //                       ${(item.quantity * item.price).toFixed(2)}
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>

// //               <Separator className="mb-4" />

// //               {/* Pricing Breakdown */}
// //               <div className="space-y-2 mb-4 md:mb-6">
// //                 <div className="flex justify-between text-sm">
// //                   <span>Subtotal</span>
// //                   <span>${subtotal.toFixed(2)}</span>
// //                 </div>
// //                 <div className="flex justify-between text-sm">
// //                   <span>Shipping</span>
// //                   <span className="text-green-600">
// //                     {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
// //                   </span>
// //                 </div>
// //                 <div className="flex justify-between text-sm">
// //                   <span>Tax</span>
// //                   <span>${tax.toFixed(2)}</span>
// //                 </div>
// //                 <Separator />
// //                 <div className="flex justify-between font-bold text-lg">
// //                   <span>Total</span>
// //                   <span className="text-green-600">${total.toFixed(2)}</span>
// //                 </div>
// //               </div>

// //               {/* Debug Information */}
// //               {process.env.NODE_ENV === "development" && (
// //                 <div className="mb-4 p-3 bg-gray-100 rounded text-xs space-y-1">
// //                   <div>
// //                     <strong>Debug Info:</strong>
// //                   </div>
// //                   <div>Form Valid: {formValid ? "✓" : "✗"}</div>
// //                   <div>Total: ${total.toFixed(2)}</div>
// //                   <div>Client Secret: {clientSecret ? "✓" : "✗"}</div>
// //                   <div>Order ID: {orderId || "None"}</div>
// //                   <div>Creating Order: {creatingOrder ? "✓" : "✗"}</div>
// //                   <div>Payment Error: {paymentError || "None"}</div>
// //                 </div>
// //               )}

// //               {/* Payment Section */}
// //               <div className="space-y-4">
// //                 <div className="flex items-center gap-2">
// //                   <CreditCard className="w-5 h-5 text-blue-600" />
// //                   <h4 className="font-semibold text-gray-900">
// //                     Complete Payment
// //                   </h4>
// //                 </div>

// //                 {!formValid && (
// //                   <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
// //                     <div className="flex items-center gap-2 text-amber-700">
// //                       <AlertCircle className="w-4 h-4" />
// //                       <span className="text-sm font-medium">
// //                         Please fill in all required fields above to proceed with
// //                         payment
// //                       </span>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {paymentError && (
// //                   <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
// //                     <div className="flex items-center gap-2 text-red-700">
// //                       <AlertCircle className="w-4 h-4" />
// //                       <div>
// //                         <p className="text-sm font-medium">
// //                           Order Creation Error
// //                         </p>
// //                         <p className="text-sm">{paymentError}</p>
// //                       </div>
// //                     </div>
// //                     <Button
// //                       onClick={createOrder}
// //                       variant="outline"
// //                       size="sm"
// //                       className="mt-2"
// //                       disabled={creatingOrder}
// //                     >
// //                       {creatingOrder ? (
// //                         <>
// //                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
// //                           Retrying...
// //                         </>
// //                       ) : (
// //                         "Retry Order Creation"
// //                       )}
// //                     </Button>
// //                   </div>
// //                 )}

// //                 {formValid && total > 0 && (
// //                   <>
// //                     {creatingOrder && (
// //                       <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
// //                         <div className="flex items-center justify-center p-6">
// //                           <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
// //                           <span className="text-gray-600">
// //                             Creating your order...
// //                           </span>
// //                         </div>
// //                       </div>
// //                     )}

// //                     {clientSecret && orderId && !creatingOrder && (
// //                       <Elements
// //                         stripe={stripePromise}
// //                         options={{
// //                           clientSecret: clientSecret,
// //                           appearance: {
// //                             theme: "stripe",
// //                             variables: {
// //                               colorPrimary: "#16a34a",
// //                               colorBackground: "#ffffff",
// //                               colorText: "#374151",
// //                               colorDanger: "#ef4444",
// //                               borderRadius: "8px",
// //                             },
// //                           },
// //                         }}
// //                         key={clientSecret} // Force re-render when clientSecret changes
// //                       >
// //                         <div className="space-y-3">
// //                           <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
// //                             <div className="text-sm text-green-700">
// //                               ✅ Order created successfully!
// //                               <br />
// //                               <span className="font-mono text-xs">
// //                                 ID: {orderId}
// //                               </span>
// //                             </div>
// //                           </div>
// //                           <StripeShopCheckout
// //                             amount={total}
// //                             onPaymentSuccess={handlePaymentSuccess}
// //                             onPaymentError={handlePaymentError}
// //                             disabled={!formValid}
// //                           />
// //                         </div>
// //                       </Elements>
// //                     )}
// //                   </>
// //                 )}
// //               </div>

// //               {/* Security Badges */}
// //               <div className="text-center space-y-2 mt-6 pt-4 border-t border-gray-100">
// //                 <div className="flex items-center justify-center text-xs text-gray-500">
// //                   <Shield className="w-4 h-4 mr-1" />
// //                   256-bit SSL encrypted
// //                 </div>
// //                 <div className="flex items-center justify-center text-xs text-gray-500">
// //                   <Lock className="w-4 h-4 mr-1" />
// //                   PCI DSS compliant payments
// //                 </div>
// //               </div>
// //             </motion.div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Mobile Bottom Navigation Spacer */}
// //       <div className="h-20 md:hidden" />
// //     </div>
// //   );
// // }
// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";

// import {
//   ArrowLeft,
//   ArrowRight,
//   Shield,
//   CreditCard,
//   Truck,
//   Store,
//   MapPin,
//   Check,
//   Lock,
//   Zap,
//   Gift,
//   Loader2,
//   AlertCircle,
//   Mail,
//   User,
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
// import { toast } from "sonner";
// import { getCart } from "@/lib/actions/cartServerActions";
// import {
//   createCheckoutSession,
//   confirmPayment,
// } from "@/lib/actions/orderServerActions";
// import StripeShopCheckout from "@/components/shop/StripeShopCheckout";

// // Initialize Stripe outside component to avoid recreating
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

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

// const checkoutSteps = [
//   {
//     id: 1,
//     title: "Contact",
//     subtitle: "Personal Info",
//     icon: User,
//     fields: ["firstName", "lastName", "email"],
//   },
//   {
//     id: 2,
//     title: "Delivery",
//     subtitle: "Method & Address",
//     icon: Truck,
//     fields: ["deliveryMethod"],
//   },
//   {
//     id: 3,
//     title: "Review",
//     subtitle: "Order Details",
//     icon: Gift,
//     fields: [],
//   },
//   {
//     id: 4,
//     title: "Payment",
//     subtitle: "Complete Order",
//     icon: CreditCard,
//     fields: [],
//   },
// ];

// export default function CheckoutPage() {
//   const [cart, setCart] = useState<CartData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [orderId, setOrderId] = useState<string | null>(null);
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [formValid, setFormValid] = useState(false);
//   const [paymentError, setPaymentError] = useState<string | null>(null);
//   const [creatingOrder, setCreatingOrder] = useState(false);

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

//   // Calculate totals
//   const subtotal =
//     cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
//   const shipping: number =
//     formData.deliveryMethod === "pickup"
//       ? 0
//       : subtotal >= 25
//         ? 0
//         : formData.deliveryMethod === "express"
//           ? 0
//           : 0;
//   const tax = 0; //Math.round((subtotal + shipping) * 0.08 * 100) / 100;
//   const total = subtotal + shipping + tax;

//   // Load cart data
//   useEffect(() => {
//     loadCart();
//   }, []);

//   // Validate form whenever formData changes
//   useEffect(() => {
//     validateForm();
//   }, [formData]);

//   // Create order and payment intent when form is valid and total > 0
//   useEffect(() => {
//     if (
//       formValid &&
//       total > 0 &&
//       !clientSecret &&
//       !paymentLoading &&
//       !creatingOrder &&
//       currentStep === 4
//     ) {
//       console.log("Conditions met for order creation:", {
//         formValid,
//         total,
//         clientSecret: !!clientSecret,
//         paymentLoading,
//         creatingOrder,
//       });
//       createOrder();
//     }
//   }, [
//     formValid,
//     total,
//     clientSecret,
//     paymentLoading,
//     creatingOrder,
//     currentStep,
//   ]);

//   const loadCart = async () => {
//     try {
//       setLoading(true);
//       const result = await getCart();

//       if (result.success && result.cart) {
//         setCart(result.cart);
//         console.log("Cart loaded:", result.cart);

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

//     // Reset payment state when form changes to trigger re-creation
//     if (clientSecret) {
//       setClientSecret(null);
//       setOrderId(null);
//       setPaymentError(null);
//     }
//   };

//   const validateForm = () => {
//     const requiredFields = ["firstName", "lastName", "email"];
//     if (formData.deliveryMethod !== "pickup") {
//       requiredFields.push("address", "city", "state", "zipCode");
//     }

//     const isValid = requiredFields.every((field) => {
//       const value = formData[field as keyof typeof formData];
//       return value && value.toString().trim() !== "";
//     });

//     // Validate email format
//     const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

//     console.log("Form validation:", {
//       isValid: isValid && emailValid,
//       requiredFields,
//       formData,
//     });
//     setFormValid(isValid && emailValid);
//   };

//   const validateCurrentStep = (): boolean => {
//     switch (currentStep) {
//       case 1:
//         return !!(
//           formData.firstName &&
//           formData.lastName &&
//           formData.email &&
//           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
//         );
//       case 2:
//         if (formData.deliveryMethod === "pickup") return true;
//         return !!(
//           formData.address &&
//           formData.city &&
//           formData.state &&
//           formData.zipCode
//         );
//       case 3:
//         return true; // Review step
//       case 4:
//         return !!(clientSecret && orderId && !creatingOrder);
//       default:
//         return false;
//     }
//   };

//   const nextStep = () => {
//     if (currentStep < checkoutSteps.length && validateCurrentStep()) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const createOrder = async () => {
//     try {
//       console.log("Creating order and payment intent for total:", total);
//       setCreatingOrder(true);
//       setPaymentError(null);

//       // Prepare checkout data according to your schema
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
//         billingAddress: undefined, // Will use shipping address
//         email: formData.email,
//         phone: formData.phone,
//         deliveryMethod: formData.deliveryMethod as
//           | "standard"
//           | "express"
//           | "pickup",
//         notes: formData.notes,
//         marketingOptIn: formData.marketingOptIn,
//       };

//       console.log("Calling createCheckoutSession with data:", checkoutData);
//       const result = await createCheckoutSession(checkoutData);
//       console.log("Checkout session result:", result);

//       if (result.success && result.clientSecret && result.orderId) {
//         console.log("Order created successfully:", {
//           orderId: result.orderId,
//           clientSecret: result.clientSecret.substring(0, 20) + "...",
//         });

//         setOrderId(result.orderId);
//         setClientSecret(result.clientSecret);

//         toast.success("Order created! Complete payment to confirm.");
//       } else {
//         console.error("Checkout session creation failed:", result.error);
//         setPaymentError(result.error || "Failed to create order");
//         toast.error(result.error || "Failed to create order");
//       }
//     } catch (error) {
//       console.error("Error creating order:", error);
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to create order";
//       setPaymentError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setCreatingOrder(false);
//     }
//   };

//   const handlePaymentSuccess = async (paymentIntentId: string) => {
//     try {
//       console.log("Payment successful, confirming order...", paymentIntentId);

//       // Confirm the payment and update order status
//       const result = await confirmPayment(paymentIntentId);

//       if (result.success && result.order) {
//         console.log("Order confirmed:", result.order);
//         setOrderComplete(true);

//         toast.success(
//           "Order placed successfully! You will receive a confirmation email shortly."
//         );

//         // Redirect to order details after 3 seconds
//         setTimeout(() => {
//           router.push(`/orders/${result.order._id}`);
//         }, 3000);
//       } else {
//         console.error("Order confirmation failed:", result.error);
//         toast.error(
//           result.error ||
//             "Payment processed but there was an issue confirming your order. Please contact support."
//         );
//       }
//     } catch (error) {
//       console.error("Error handling payment success:", error);
//       toast.error(
//         "Payment processed but there was an issue confirming your order. Please contact support."
//       );
//     }
//   };

//   const handlePaymentError = (error: string) => {
//     console.error("Payment error:", error);
//     setPaymentError(error);
//     toast.error("Payment failed: " + error);
//   };

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
//           {orderId && (
//             <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//               <p className="text-sm text-green-700">
//                 Order ID: <span className="font-mono font-bold">{orderId}</span>
//               </p>
//             </div>
//           )}
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

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <Card className="glass border-white/20">
//             <CardHeader>
//               <CardTitle className="flex items-center text-xl">
//                 <User className="w-5 h-5 mr-2 text-blue-600" />
//                 Contact Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="firstName">First Name *</Label>
//                   <Input
//                     id="firstName"
//                     value={formData.firstName}
//                     onChange={(e) =>
//                       handleInputChange("firstName", e.target.value)
//                     }
//                     className="bg-white/60 border-white/40"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="lastName">Last Name *</Label>
//                   <Input
//                     id="lastName"
//                     value={formData.lastName}
//                     onChange={(e) =>
//                       handleInputChange("lastName", e.target.value)
//                     }
//                     className="bg-white/60 border-white/40"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange("email", e.target.value)}
//                   className="bg-white/60 border-white/40"
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="phone">Phone Number</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => handleInputChange("phone", e.target.value)}
//                   className="bg-white/60 border-white/40"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             {/* Delivery Method */}
//             <Card className="glass border-white/20">
//               <CardHeader>
//                 <CardTitle className="flex items-center text-xl">
//                   <Truck className="w-5 h-5 mr-2 text-green-600" />
//                   Delivery Method
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <RadioGroup
//                   value={formData.deliveryMethod}
//                   onValueChange={(value) =>
//                     handleInputChange("deliveryMethod", value)
//                   }
//                 >
//                   <div className="space-y-3">
//                     <Label
//                       htmlFor="standard"
//                       className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
//                     >
//                       <div className="flex items-center space-x-3">
//                         <RadioGroupItem value="standard" id="standard" />
//                         <div className="flex items-center">
//                           <Truck className="w-5 h-5 mr-2 text-blue-600" />
//                           <div>
//                             <div className="font-medium text-sm md:text-base">
//                               Standard Delivery
//                             </div>
//                             <div className="text-xs md:text-sm text-gray-500">
//                               5-7 business days
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <Badge
//                         variant="secondary"
//                         className="bg-green-100 text-green-700"
//                       >
//                         {subtotal >= 25 ? "FREE" : "$0.00"}
//                       </Badge>
//                     </Label>

//                     <Label
//                       htmlFor="express"
//                       className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
//                     >
//                       <div className="flex items-center space-x-3">
//                         <RadioGroupItem value="express" id="express" />
//                         <div className="flex items-center">
//                           <Zap className="w-5 h-5 mr-2 text-amber-600" />
//                           <div>
//                             <div className="font-medium text-sm md:text-base">
//                               Express Delivery
//                             </div>
//                             <div className="text-xs md:text-sm text-gray-500">
//                               2-3 business days
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <Badge variant="outline">$0.00</Badge>
//                     </Label>

//                     <Label
//                       htmlFor="pickup"
//                       className="flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
//                     >
//                       <div className="flex items-center space-x-3">
//                         <RadioGroupItem value="pickup" id="pickup" />
//                         <div className="flex items-center">
//                           <Store className="w-5 h-5 mr-2 text-green-600" />
//                           <div>
//                             <div className="font-medium text-sm md:text-base">
//                               Store Pickup
//                             </div>
//                             <div className="text-xs md:text-sm text-gray-500">
//                               Available same day
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       <Badge
//                         variant="secondary"
//                         className="bg-green-100 text-green-700"
//                       >
//                         FREE
//                       </Badge>
//                     </Label>
//                   </div>
//                 </RadioGroup>
//               </CardContent>
//             </Card>

//             {/* Shipping Address */}
//             {formData.deliveryMethod !== "pickup" && (
//               <Card className="glass border-white/20">
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-xl">
//                     <MapPin className="w-5 h-5 mr-2 text-red-600" />
//                     Shipping Address
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <Label htmlFor="address">Street Address *</Label>
//                     <Input
//                       id="address"
//                       value={formData.address}
//                       onChange={(e) =>
//                         handleInputChange("address", e.target.value)
//                       }
//                       className="bg-white/60 border-white/40"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="apartment">Apartment, Suite, etc.</Label>
//                     <Input
//                       id="apartment"
//                       value={formData.apartment}
//                       onChange={(e) =>
//                         handleInputChange("apartment", e.target.value)
//                       }
//                       className="bg-white/60 border-white/40"
//                     />
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <Label htmlFor="city">City *</Label>
//                       <Input
//                         id="city"
//                         value={formData.city}
//                         onChange={(e) =>
//                           handleInputChange("city", e.target.value)
//                         }
//                         className="bg-white/60 border-white/40"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="state">State *</Label>
//                       <Select
//                         value={formData.state}
//                         onValueChange={(value) =>
//                           handleInputChange("state", value)
//                         }
//                       >
//                         <SelectTrigger className="bg-white/60 border-white/40">
//                           <SelectValue placeholder="Select state" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="AL">Alabama</SelectItem>
//                           <SelectItem value="AK">Alaska</SelectItem>
//                           <SelectItem value="AZ">Arizona</SelectItem>
//                           <SelectItem value="AR">Arkansas</SelectItem>
//                           <SelectItem value="CA">California</SelectItem>
//                           <SelectItem value="CO">Colorado</SelectItem>
//                           <SelectItem value="CT">Connecticut</SelectItem>
//                           <SelectItem value="DE">Delaware</SelectItem>
//                           <SelectItem value="FL">Florida</SelectItem>
//                           <SelectItem value="GA">Georgia</SelectItem>
//                           <SelectItem value="HI">Hawaii</SelectItem>
//                           <SelectItem value="ID">Idaho</SelectItem>
//                           <SelectItem value="IL">Illinois</SelectItem>
//                           <SelectItem value="IN">Indiana</SelectItem>
//                           <SelectItem value="IA">Iowa</SelectItem>
//                           <SelectItem value="KS">Kansas</SelectItem>
//                           <SelectItem value="KY">Kentucky</SelectItem>
//                           <SelectItem value="LA">Louisiana</SelectItem>
//                           <SelectItem value="ME">Maine</SelectItem>
//                           <SelectItem value="MD">Maryland</SelectItem>
//                           <SelectItem value="MA">Massachusetts</SelectItem>
//                           <SelectItem value="MI">Michigan</SelectItem>
//                           <SelectItem value="MN">Minnesota</SelectItem>
//                           <SelectItem value="MS">Mississippi</SelectItem>
//                           <SelectItem value="MO">Missouri</SelectItem>
//                           <SelectItem value="MT">Montana</SelectItem>
//                           <SelectItem value="NE">Nebraska</SelectItem>
//                           <SelectItem value="NV">Nevada</SelectItem>
//                           <SelectItem value="NH">New Hampshire</SelectItem>
//                           <SelectItem value="NJ">New Jersey</SelectItem>
//                           <SelectItem value="NM">New Mexico</SelectItem>
//                           <SelectItem value="NY">New York</SelectItem>
//                           <SelectItem value="NC">North Carolina</SelectItem>
//                           <SelectItem value="ND">North Dakota</SelectItem>
//                           <SelectItem value="OH">Ohio</SelectItem>
//                           <SelectItem value="OK">Oklahoma</SelectItem>
//                           <SelectItem value="OR">Oregon</SelectItem>
//                           <SelectItem value="PA">Pennsylvania</SelectItem>
//                           <SelectItem value="RI">Rhode Island</SelectItem>
//                           <SelectItem value="SC">South Carolina</SelectItem>
//                           <SelectItem value="SD">South Dakota</SelectItem>
//                           <SelectItem value="TN">Tennessee</SelectItem>
//                           <SelectItem value="TX">Texas</SelectItem>
//                           <SelectItem value="UT">Utah</SelectItem>
//                           <SelectItem value="VT">Vermont</SelectItem>
//                           <SelectItem value="VA">Virginia</SelectItem>
//                           <SelectItem value="WA">Washington</SelectItem>
//                           <SelectItem value="WV">West Virginia</SelectItem>
//                           <SelectItem value="WI">Wisconsin</SelectItem>
//                           <SelectItem value="WY">Wyoming</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div>
//                       <Label htmlFor="zipCode">ZIP Code *</Label>
//                       <Input
//                         id="zipCode"
//                         value={formData.zipCode}
//                         onChange={(e) =>
//                           handleInputChange("zipCode", e.target.value)
//                         }
//                         className="bg-white/60 border-white/40"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Additional Options */}
//             <Card className="glass border-white/20">
//               <CardContent className="pt-6 space-y-4">
//                 <div>
//                   <Label htmlFor="notes">Order Notes (Optional)</Label>
//                   <Input
//                     id="notes"
//                     value={formData.notes}
//                     onChange={(e) => handleInputChange("notes", e.target.value)}
//                     className="bg-white/60 border-white/40"
//                     placeholder="Special delivery instructions..."
//                   />
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="marketing"
//                     checked={formData.marketingOptIn}
//                     onCheckedChange={(checked) =>
//                       handleInputChange("marketingOptIn", checked === true)
//                     }
//                   />
//                   <Label htmlFor="marketing" className="text-sm">
//                     Send me special offers and wellness tips
//                   </Label>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         );

//       case 3:
//         return (
//           <Card className="glass border-white/20">
//             <CardHeader>
//               <CardTitle className="flex items-center text-xl">
//                 <Gift className="w-5 h-5 mr-2 text-purple-600" />
//                 Review Your Order
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Contact Info Summary */}
//               <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <h4 className="font-medium text-blue-900 mb-2">
//                   Contact Information
//                 </h4>
//                 <p className="text-sm text-blue-700">
//                   {formData.firstName} {formData.lastName}
//                 </p>
//                 <p className="text-sm text-blue-700">{formData.email}</p>
//                 {formData.phone && (
//                   <p className="text-sm text-blue-700">{formData.phone}</p>
//                 )}
//               </div>

//               {/* Delivery Info Summary */}
//               <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <h4 className="font-medium text-green-900 mb-2">
//                   Delivery Information
//                 </h4>
//                 <p className="text-sm text-green-700 capitalize">
//                   {formData.deliveryMethod.replace("-", " ")} Delivery
//                 </p>
//                 {formData.deliveryMethod !== "pickup" && (
//                   <div className="text-sm text-green-700 mt-1">
//                     <p>
//                       {formData.address} {formData.apartment}
//                     </p>
//                     <p>
//                       {formData.city}, {formData.state} {formData.zipCode}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Order Items */}
//               <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
//                 <h4 className="font-medium text-purple-900 mb-3">
//                   Order Items
//                 </h4>
//                 <div className="space-y-3">
//                   {cart?.items.map((item) => (
//                     <div key={item._id} className="flex items-center gap-3">
//                       <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
//                         <Image
//                           src={
//                             item.product.images[0] || "/api/placeholder/300/300"
//                           }
//                           alt={item.product.name}
//                           fill
//                           className="object-cover"
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <h5 className="font-medium text-sm text-purple-900">
//                           {item.product.name}
//                         </h5>
//                         <p className="text-xs text-purple-600">
//                           Qty: {item.quantity} × ${item.price.toFixed(2)}
//                         </p>
//                       </div>
//                       <div className="text-sm font-medium text-purple-900">
//                         ${(item.quantity * item.price).toFixed(2)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Order Total */}
//               <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Subtotal</span>
//                     <span>${subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>Shipping</span>
//                     <span className="text-green-600">
//                       {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>Tax</span>
//                     <span>${tax.toFixed(2)}</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between font-bold text-lg">
//                     <span>Total</span>
//                     <span className="text-green-600">${total.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 4:
//         return (
//           <Card className="glass border-white/20">
//             <CardHeader>
//               <CardTitle className="flex items-center text-xl">
//                 <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
//                 Complete Payment
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {!formValid && (
//                 <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
//                   <div className="flex items-center gap-2 text-amber-700">
//                     <AlertCircle className="w-4 h-4" />
//                     <span className="text-sm font-medium">
//                       Please complete all required fields to proceed with
//                       payment
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {paymentError && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <div className="flex items-center gap-2 text-red-700">
//                     <AlertCircle className="w-4 h-4" />
//                     <div>
//                       <p className="text-sm font-medium">
//                         Order Creation Error
//                       </p>
//                       <p className="text-sm">{paymentError}</p>
//                     </div>
//                   </div>
//                   <Button
//                     onClick={createOrder}
//                     variant="outline"
//                     size="sm"
//                     className="mt-2"
//                     disabled={creatingOrder}
//                   >
//                     {creatingOrder ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Retrying...
//                       </>
//                     ) : (
//                       "Retry Order Creation"
//                     )}
//                   </Button>
//                 </div>
//               )}

//               {formValid && total > 0 && (
//                 <>
//                   {creatingOrder && (
//                     <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
//                       <div className="flex items-center justify-center p-6">
//                         <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
//                         <span className="text-gray-600">
//                           Creating your order...
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {clientSecret && orderId && !creatingOrder && (
//                     <Elements
//                       stripe={stripePromise}
//                       options={{
//                         clientSecret: clientSecret,
//                         appearance: {
//                           theme: "stripe",
//                           variables: {
//                             colorPrimary: "#16a34a",
//                             colorBackground: "#ffffff",
//                             colorText: "#374151",
//                             colorDanger: "#ef4444",
//                             borderRadius: "8px",
//                           },
//                         },
//                       }}
//                       key={clientSecret}
//                     >
//                       <div className="space-y-3">
//                         <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                           <div className="text-sm text-green-700">
//                             ✅ Order created successfully!
//                             <br />
//                             <span className="font-mono text-xs">
//                               ID: {orderId}
//                             </span>
//                           </div>
//                         </div>
//                         <StripeShopCheckout
//                           amount={total}
//                           onPaymentSuccess={handlePaymentSuccess}
//                           onPaymentError={handlePaymentError}
//                           disabled={!formValid}
//                         />
//                       </div>
//                     </Elements>
//                   )}
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         );

//       default:
//         return null;
//     }
//   };

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

//       {/* Step Progress Indicator */}
//       <div className="container mx-auto px-4 py-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="relative">
//             {/* Progress Bar Background */}
//             <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full" />

//             {/* Progress Bar Fill */}
//             <div
//               className="absolute top-8 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
//               style={{
//                 width: `${((currentStep - 1) / (checkoutSteps.length - 1)) * 100}%`,
//               }}
//             />

//             {/* Steps */}
//             <div className="relative flex justify-between">
//               {checkoutSteps.map((step, index) => {
//                 const isActive = currentStep === step.id;
//                 const isCompleted = currentStep > step.id;
//                 const IconComponent = step.icon;

//                 return (
//                   <div key={step.id} className="flex flex-col items-center">
//                     <motion.div
//                       initial={false}
//                       animate={{
//                         scale: isActive ? 1.1 : 1,
//                         backgroundColor: isCompleted
//                           ? "#10b981"
//                           : isActive
//                             ? "#3b82f6"
//                             : "#e5e7eb",
//                       }}
//                       className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
//                         isCompleted || isActive
//                           ? "border-white shadow-lg"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       {isCompleted ? (
//                         <Check className="w-6 h-6 text-white" />
//                       ) : (
//                         <IconComponent
//                           className={`w-6 h-6 ${
//                             isActive ? "text-white" : "text-gray-500"
//                           }`}
//                         />
//                       )}
//                     </motion.div>
//                     <div className="mt-3 text-center">
//                       <p
//                         className={`text-sm font-medium ${
//                           isActive || isCompleted
//                             ? "text-gray-900"
//                             : "text-gray-500"
//                         }`}
//                       >
//                         {step.title}
//                       </p>
//                       <p
//                         className={`text-xs ${
//                           isActive || isCompleted
//                             ? "text-gray-600"
//                             : "text-gray-400"
//                         }`}
//                       >
//                         {step.subtitle}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 pb-8">
//         <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             <motion.div
//               key={currentStep}
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {renderStepContent()}

//               {/* Navigation Buttons */}
//               <div className="flex justify-between mt-6">
//                 <Button
//                   variant="outline"
//                   onClick={prevStep}
//                   disabled={currentStep === 1}
//                   className="flex items-center"
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-2" />
//                   Previous
//                 </Button>

//                 {currentStep < checkoutSteps.length && (
//                   <Button
//                     onClick={nextStep}
//                     disabled={!validateCurrentStep()}
//                     className="flex items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
//                   >
//                     Next
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </Button>
//                 )}
//               </div>
//             </motion.div>
//           </div>

//           {/* Order Summary Sidebar - KEPT YOUR ORIGINAL */}
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
//               <div className="text-center space-y-2 pt-4 border-t border-gray-100">
//                 <div className="flex items-center justify-center text-xs text-gray-500">
//                   <Shield className="w-4 h-4 mr-1" />
//                   256-bit SSL encrypted
//                 </div>
//                 <div className="flex items-center justify-center text-xs text-gray-500">
//                   <Lock className="w-4 h-4 mr-1" />
//                   PCI DSS compliant payments
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
// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

// Import our components
import CheckoutProgress from "./components/CheckoutProgress";
import ContactStep from "./components/ContactStep";
import DeliveryMethodStep from "./components/DeliveryMethodStep";
import AddressStep from "./components/AddressStep";
import ReviewStep from "./components/ReviewStep";
import PaymentStep from "./components/PaymentStep";
import OrderSummary from "./components/OrderSummary";
import SuccessPage from "./components/SuccessPage";

// Import actions and types
import { getCart } from "@/lib/actions/cartServerActions";
import {
  createCheckoutSession,
  confirmPayment,
} from "@/lib/actions/orderServerActions";

// Import validation utilities
import { validateStep, getStepErrors } from "./utils/validation";
import { checkoutSteps } from "./utils/constants";
import type { FormData, CartData, StepErrors } from "./types";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CheckoutPage() {
  // State management
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

  // Form state
  const [formData, setFormData] = useState<FormData>({
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

  // Calculate totals
  const subtotal =
    cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
  const shipping =
    formData.deliveryMethod === "pickup" ? 0 : subtotal >= 25 ? 0 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  // Load cart data
  useEffect(() => {
    loadCart();
  }, []);

  // Validate form and create order when on payment step
  useEffect(() => {
    if (currentStep === 5 && !clientSecret && !creatingOrder && !paymentError) {
      const allStepsValid = [1, 2, 3, 4].every((step) =>
        validateStep(step, formData)
      );
      if (allStepsValid && total > 0) {
        createOrder();
      }
    }
  }, [currentStep, formData, clientSecret, creatingOrder, paymentError, total]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const result = await getCart();

      if (result.success && result.cart) {
        setCart(result.cart);

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

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors for this field
    setStepErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((step) => {
        if (newErrors[parseInt(step)]?.[field]) {
          delete newErrors[parseInt(step)][field];
          if (Object.keys(newErrors[parseInt(step)]).length === 0) {
            delete newErrors[parseInt(step)];
          }
        }
      });
      return newErrors;
    });

    // Reset payment state when form changes
    if (clientSecret) {
      setClientSecret(null);
      setOrderId(null);
      setPaymentError(null);
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors = getStepErrors(currentStep, formData);

    if (Object.keys(errors).length > 0) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: errors }));
      return false;
    } else {
      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
      return true;
    }
  };

  const goToStep = (stepNumber: number) => {
    // Only allow navigation to previous steps or next step if current is valid
    if (
      stepNumber < currentStep ||
      (stepNumber === currentStep + 1 && validateCurrentStep())
    ) {
      setCurrentStep(stepNumber);
    } else if (stepNumber > currentStep) {
      // Validate all steps up to the target step
      let canNavigate = true;
      for (let i = currentStep; i < stepNumber; i++) {
        const errors = getStepErrors(i, formData);
        if (Object.keys(errors).length > 0) {
          setStepErrors((prev) => ({ ...prev, [i]: errors }));
          canNavigate = false;
          break;
        }
      }
      if (canNavigate) {
        setCurrentStep(stepNumber);
      } else {
        toast.error("Please complete all required fields in previous steps");
      }
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < checkoutSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createOrder = async () => {
    try {
      setCreatingOrder(true);
      setPaymentError(null);

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
        billingAddress: undefined,
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

      if (result.success && result.clientSecret && result.orderId) {
        setOrderId(result.orderId);
        setClientSecret(result.clientSecret);
        toast.success("Order created! Complete payment to confirm.");
      } else {
        setPaymentError(result.error || "Failed to create order");
        toast.error(result.error || "Failed to create order");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const result = await confirmPayment(paymentIntentId);

      if (result.success && result.order) {
        setOrderComplete(true);
        toast.success(
          "Order placed successfully! You will receive a confirmation email shortly."
        );

        // setTimeout(() => {
        //   router.push(`/orders/${result.order._id}`);
        // }, 3000);
      } else {
        toast.error(
          result.error ||
            "Payment processed but there was an issue confirming your order. Please contact support."
        );
      }
    } catch (error) {
      toast.error(
        "Payment processed but there was an issue confirming your order. Please contact support."
      );
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    toast.error("Payment failed: " + error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete && orderId) {
    return <SuccessPage orderId={orderId} />;
  }

  const renderStepContent = () => {
    const stepProps = {
      formData,
      onInputChange: handleInputChange,
      errors: stepErrors[currentStep] || {},
      subtotal,
      shipping,
    };

    switch (currentStep) {
      case 1:
        return <ContactStep {...stepProps} />;
      case 2:
        return <DeliveryMethodStep {...stepProps} />;
      case 3:
        return <AddressStep {...stepProps} />;
      case 4:
        return (
          <ReviewStep {...stepProps} cart={cart} total={total} tax={tax} />
        );
      case 5:
        return (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecret || undefined,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#ea580c",
                  colorBackground: "#ffffff",
                  colorText: "#374151",
                  colorDanger: "#ef4444",
                  borderRadius: "8px",
                },
              },
            }}
            key={clientSecret}
          >
            <PaymentStep
              {...stepProps}
              total={total}
              clientSecret={clientSecret}
              orderId={orderId}
              creatingOrder={creatingOrder}
              paymentError={paymentError}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onRetryOrder={createOrder}
            />
          </Elements>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Cart</span>
                <span className="sm:hidden">Cart</span>
              </Link>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
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

      {/* Progress Indicator */}
      <CheckoutProgress
        currentStep={currentStep}
        onStepClick={goToStep}
        stepErrors={stepErrors}
        formData={formData}
      />

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < checkoutSteps.length && (
                  <Button
                    onClick={nextStep}
                    disabled={
                      Object.keys(stepErrors[currentStep] || {}).length > 0
                    }
                    className="flex items-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    Next
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
