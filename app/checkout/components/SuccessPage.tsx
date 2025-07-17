// app/checkout/components/SuccessPage.tsx

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  orderId: string;
  customerEmail?: string;
}

export default function SuccessPage({
  orderId,
  customerEmail,
}: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-8 max-w-md mx-auto"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          {/* Animated rings */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 w-24 h-24 border-4 border-green-400 rounded-full mx-auto"
          />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Order Confirmed! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for choosing Nutra Vive! Your wellness journey
            continues...
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="p-6 bg-white rounded-2xl shadow-lg border border-white/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Package className="w-5 h-5" />
              <span className="font-medium">Order Placed Successfully</span>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Order ID</p>
              <p className="text-green-900 font-mono text-lg">{orderId}</p>
            </div>

            <div className="flex items-start space-x-3 text-left">
              <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  Confirmation email sent
                </p>
                <p className="text-gray-600">
                  Check your inbox for order details and tracking information.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">What's next?</h3>
          <div className="space-y-3 text-sm text-gray-600 text-left max-w-sm mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold text-xs">1</span>
              </div>
              <p>We'll prepare your order with care and attention</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold text-xs">2</span>
              </div>
              <p>You'll receive tracking information once shipped</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold text-xs">3</span>
              </div>
              <p>Enjoy your natural wellness products!</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="space-y-3"
        >
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
            size="lg"
            asChild
          >
            <Link
              href={`/track?order=${orderId}${customerEmail ? `&email=${encodeURIComponent(customerEmail)}` : ""}`}
            >
              Track Your Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
            size="lg"
            asChild
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-xs text-gray-500"
        >
          <p>Need help? Contact us at support@nutraviveholistic.com</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
