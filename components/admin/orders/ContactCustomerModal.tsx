"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { sendCustomerEmail } from "@/lib/actions/emailServerActions";
import { toast } from "sonner";

interface ContactCustomerModalProps {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trigger?: React.ReactNode;
}

export function ContactCustomerModal({
  customerEmail,
  customerName,
  orderNumber,
  trigger,
}: ContactCustomerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState(`Regarding Your Order ${orderNumber} - Nutra-Vive`);
  const [message, setMessage] = useState(
    `Dear ${customerName},\n\nI hope this message finds you well. I'm reaching out regarding your recent order ${orderNumber}.\n\n\n\nBest regards,\nThe Nutra-Vive Team`
  );

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendCustomerEmail({
        customerEmail,
        subject,
        message,
        orderNumber,
      });

      if (result.success) {
        toast.success(result.message || `Email sent successfully to ${customerEmail}`);
        setIsOpen(false);
        // Reset form
        setSubject(`Regarding Your Order ${orderNumber} - Nutra-Vive`);
        setMessage(
          `Dear ${customerName},\n\nI hope this message finds you well. I'm reaching out regarding your recent order ${orderNumber}.\n\n\n\nBest regards,\nThe Nutra-Vive Team`
        );
      } else {
        toast.error(result.error || "Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred while sending the email");
    } finally {
      setIsSending(false);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="gap-2">
      <MessageSquare className="h-4 w-4" />
      Contact Customer
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Customer</DialogTitle>
          <DialogDescription>
            Send an email to {customerName} ({customerEmail}) regarding order {orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              value={`${customerName} <${customerEmail}>`}
              disabled
              className="bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message to the customer"
              rows={8}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={!subject.trim() || !message.trim() || isSending}
          >
            {isSending ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}