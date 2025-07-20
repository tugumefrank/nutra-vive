"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendCustomerSupportEmail } from "@/lib/actions/supportServerActions";

interface ContactSupportDialogProps {
  orderNumber?: string;
  customerEmail?: string;
}

interface FormData {
  subject: string;
  message: string;
  customerEmail: string;
  customerName: string;
}

export default function ContactSupportDialog({
  orderNumber,
  customerEmail,
}: ContactSupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    subject: orderNumber ? `Support Request for Order ${orderNumber}` : "",
    message: "",
    customerEmail: customerEmail || "",
    customerName: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.customerEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    setSending(true);

    try {
      const result = await sendCustomerSupportEmail({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        subject: formData.subject,
        message: formData.message,
        orderNumber: orderNumber,
      });

      if (result.success) {
        toast.success("Your message has been sent! We'll get back to you soon.");
        setOpen(false);
        // Reset form
        setFormData({
          subject: orderNumber ? `Support Request for Order ${orderNumber}` : "",
          message: "",
          customerEmail: customerEmail || "",
          customerName: "",
        });
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending support email:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800 shadow-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span>Contact Support</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Need help with your order or have questions? Send us a message and
            we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Your Name *
              </Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={sending}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                disabled={sending}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject *
            </Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="What do you need help with?"
              disabled={sending}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Please describe your question or issue in detail..."
              rows={5}
              disabled={sending}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>

          {orderNumber && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Order Reference:</span> {orderNumber}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This order number will be included in your support request.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}