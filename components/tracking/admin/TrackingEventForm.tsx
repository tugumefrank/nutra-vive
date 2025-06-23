"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Package,
  MapPin,
  Calendar,
  Clock,
  Truck,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { addTrackingEvent } from "@/lib/actions/orderTrackingServerActions";

interface TrackingEventFormProps {
  orderId?: string;
  orderNumber?: string;
  currentStatus?: string;
  onEventAdded?: (event: any) => void;
  trigger?: React.ReactNode;
}

const eventTypes = [
  {
    value: "order_placed",
    label: "Order Placed",
    description: "Order has been received and confirmed",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    value: "payment_confirmed",
    label: "Payment Confirmed",
    description: "Payment has been processed successfully",
    icon: Check,
    color: "bg-green-500",
  },
  {
    value: "processing",
    label: "Processing",
    description: "Order is being prepared for shipment",
    icon: Package,
    color: "bg-yellow-500",
  },
  {
    value: "shipped",
    label: "Shipped",
    description: "Order has been dispatched",
    icon: Truck,
    color: "bg-purple-500",
  },
  {
    value: "in_transit",
    label: "In Transit",
    description: "Package is on its way to destination",
    icon: MapPin,
    color: "bg-indigo-500",
  },
  {
    value: "out_for_delivery",
    label: "Out for Delivery",
    description: "Package is out for final delivery",
    icon: Truck,
    color: "bg-orange-500",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Package has been successfully delivered",
    icon: Check,
    color: "bg-green-600",
  },
  {
    value: "exception",
    label: "Exception",
    description: "Delivery exception or issue occurred",
    icon: AlertCircle,
    color: "bg-red-500",
  },
  {
    value: "returned",
    label: "Returned",
    description: "Package has been returned",
    icon: Package,
    color: "bg-gray-500",
  },
];

const carriers = ["UPS", "FedEx", "USPS", "DHL", "Amazon", "Other"];

const locationSuggestions = [
  "Distribution Center",
  "Local Facility",
  "Out for Delivery",
  "Customer Address",
  "Pickup Location",
];

export default function TrackingEventForm({
  orderId,
  orderNumber,
  currentStatus,
  onEventAdded,
  trigger,
}: TrackingEventFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderId: orderId || "",
    status: "",
    description: "",
    location: "",
    carrier: "",
    estimatedDelivery: "",
    facility: "",
    city: "",
    state: "",
    country: "United States",
    customTimestamp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedEventType = eventTypes.find(
    (type) => type.value === formData.status
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.orderId) newErrors.orderId = "Order ID is required";
    if (!formData.status) newErrors.status = "Event type is required";
    if (!formData.description)
      newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const eventData = {
        orderId: formData.orderId,
        status: formData.status as any,
        description: formData.description,
        location: formData.location || undefined,
        carrier: formData.carrier || undefined,
        estimatedDelivery: formData.estimatedDelivery
          ? new Date(formData.estimatedDelivery)
          : undefined,
        metadata: {
          facility: formData.facility || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          country: formData.country || undefined,
        },
      };

      const result = await addTrackingEvent(eventData);

      if (result.success) {
        toast.success(
          "The tracking event has been successfully added to the order."
        );

        onEventAdded?.(result.event);
        setIsOpen(false);

        // Reset form
        setFormData({
          orderId: orderId || "",
          status: "",
          description: "",
          location: "",
          carrier: "",
          estimatedDelivery: "",
          facility: "",
          city: "",
          state: "",
          country: "United States",
          customTimestamp: "",
        });
      } else {
        toast.error(result.error || "Failed to add tracking event");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDescription = (status: string) => {
    const eventType = eventTypes.find((type) => type.value === status);
    if (eventType && !formData.description) {
      setFormData((prev) => ({
        ...prev,
        description: eventType.description,
      }));
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="bg-green-600 hover:bg-green-700">
      <Plus className="w-4 h-4 mr-2" />
      Add Tracking Event
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span>Add Tracking Event</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Selection */}
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID *</Label>
            <Input
              id="orderId"
              value={formData.orderId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderId: e.target.value }))
              }
              placeholder="Enter order ID or order number"
              className={errors.orderId ? "border-red-500" : ""}
            />
            {orderNumber && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order: {orderNumber}
              </p>
            )}
            {errors.orderId && (
              <p className="text-sm text-red-500">{errors.orderId}</p>
            )}
          </div>

          {/* Event Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Event Type *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, status: value }));
                updateDescription(value);
              }}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full ${type.color} flex items-center justify-center`}
                        >
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-gray-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status}</p>
            )}
          </div>

          {/* Event Preview */}
          {selectedEventType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full ${selectedEventType.color} flex items-center justify-center`}
                >
                  <selectedEventType.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedEventType.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedEventType.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter a detailed description of this tracking event"
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g., New York, NY"
                list="location-suggestions"
              />
              <datalist id="location-suggestions">
                {locationSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Select
                value={formData.carrier}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, carrier: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facility">Facility</Label>
              <Input
                id="facility"
                value={formData.facility}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, facility: e.target.value }))
                }
                placeholder="Distribution center, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="City name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="State or province"
              />
            </div>
          </div>

          {/* Estimated Delivery */}
          {(formData.status === "shipped" ||
            formData.status === "in_transit") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
              <Input
                id="estimatedDelivery"
                type="datetime-local"
                value={formData.estimatedDelivery}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedDelivery: e.target.value,
                  }))
                }
              />
            </motion.div>
          )}

          {/* Warning for certain statuses */}
          {(formData.status === "delivered" ||
            formData.status === "exception") && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formData.status === "delivered"
                  ? "This will mark the order as delivered. Make sure the package was actually delivered."
                  : "This will create an exception event. Consider providing detailed information about the issue."}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Adding Event..." : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
