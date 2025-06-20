"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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

// Mock order data
const orderItems = [
  {
    id: "1",
    name: "Berry Day Antioxidant Juice",
    image: "/api/placeholder/80/80",
    price: 8.87,
    quantity: 2,
    total: 17.74,
  },
  {
    id: "2",
    name: "Green Matcha Tea Latte",
    image: "/api/placeholder/80/80",
    price: 10.5,
    quantity: 1,
    total: 10.5,
  },
];

const subtotal = 28.24;
const shipping: number = 0;
const tax = 2.26;
const total = 30.5;

export default function DirectCheckout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
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
  });

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [saveInfo, setSaveInfo] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const proceedToPayment = () => {
    setCurrentStep(2);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      setCurrentStep(3);
    }, 3000);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order #NV-12345 has been confirmed
            and will be processed shortly.
          </p>
          <div className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/orders">Track Your Order</Link>
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
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <div className="flex items-center text-sm text-gray-600">
              <Lock className="w-4 h-4 mr-1" />
              Secure
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-8 mb-8">
          {[
            { step: 1, label: "Shipping", icon: Truck },
            { step: 2, label: "Payment", icon: CreditCard },
            { step: 3, label: "Confirmation", icon: Check },
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${
                  currentStep >= step
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-300 text-gray-400"
                }
              `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? "text-green-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {step < 3 && (
                <div
                  className={`w-8 h-0.5 ml-4 ${
                    currentStep > step ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Contact Information */}
                <Card className="glass border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/60 border-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
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
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-green-600" />
                      Delivery Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={deliveryMethod}
                      onValueChange={setDeliveryMethod}
                    >
                      <div className="space-y-3">
                        <Label
                          htmlFor="standard"
                          className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="standard" id="standard" />
                            <div className="flex items-center">
                              <Truck className="w-5 h-5 mr-2 text-blue-600" />
                              <div>
                                <div className="font-medium">
                                  Standard Delivery
                                </div>
                                <div className="text-sm text-gray-500">
                                  5-7 business days
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

                        <Label
                          htmlFor="express"
                          className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="express" id="express" />
                            <div className="flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-amber-600" />
                              <div>
                                <div className="font-medium">
                                  Express Delivery
                                </div>
                                <div className="text-sm text-gray-500">
                                  2-3 business days
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">$9.99</Badge>
                        </Label>

                        <Label
                          htmlFor="pickup"
                          className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <div className="flex items-center">
                              <Store className="w-5 h-5 mr-2 text-green-600" />
                              <div>
                                <div className="font-medium">Store Pickup</div>
                                <div className="text-sm text-gray-500">
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
                {deliveryMethod !== "pickup" && (
                  <Card className="glass border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-red-600" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={shippingInfo.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apartment">
                          Apartment, Suite, etc. (Optional)
                        </Label>
                        <Input
                          id="apartment"
                          value={shippingInfo.apartment}
                          onChange={(e) =>
                            handleInputChange("apartment", e.target.value)
                          }
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="bg-white/60 border-white/40"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Select
                            value={shippingInfo.state}
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
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={shippingInfo.zipCode}
                            onChange={(e) =>
                              handleInputChange("zipCode", e.target.value)
                            }
                            className="bg-white/60 border-white/40"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={proceedToPayment}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Payment Method */}
                <Card className="glass border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <div className="space-y-3">
                        <Label
                          htmlFor="card"
                          className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value="card" id="card" />
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Credit/Debit Card</span>
                        </Label>
                        <Label
                          htmlFor="paypal"
                          className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value="paypal" id="paypal" />
                          <div className="w-5 h-5 bg-blue-500 rounded" />
                          <span className="font-medium">PayPal</span>
                        </Label>
                        <Label
                          htmlFor="apple"
                          className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value="apple" id="apple" />
                          <div className="w-5 h-5 bg-black rounded" />
                          <span className="font-medium">Apple Pay</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Card Details */}
                {paymentMethod === "card" && (
                  <Card className="glass border-white/20">
                    <CardHeader>
                      <CardTitle>Card Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className="bg-white/60 border-white/40"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            className="bg-white/60 border-white/40"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          className="bg-white/60 border-white/40"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Options */}
                <Card className="glass border-white/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveInfo"
                        checked={saveInfo}
                        onCheckedChange={(checked) =>
                          setSaveInfo(checked === true)
                        }
                      />
                      <Label htmlFor="saveInfo" className="text-sm">
                        Save payment information for future purchases
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={marketingOptIn}
                        onCheckedChange={(checked) =>
                          setMarketingOptIn(checked === true)
                        }
                      />
                      <Label htmlFor="marketing" className="text-sm">
                        Send me special offers and wellness tips
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-3 rounded-2xl"
                  >
                    Back to Shipping
                  </Button>
                  <Button
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl"
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Pay $${total.toFixed(2)}`}
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
              className="glass rounded-3xl p-6 bg-white border border-white/20 sticky top-24"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-600" />
                Order Summary
              </h3>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-6">
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

              {/* Security Badge */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Shield className="w-4 h-4 mr-1" />
                  256-bit SSL encrypted checkout
                </div>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Lock className="w-4 h-4 mr-1" />
                  PCI DSS compliant payments
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4"
          >
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600 text-sm">
              Please wait while we securely process your payment...
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
