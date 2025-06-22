// app/checkout/components/ContactStep.tsx

import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepProps } from "../types";

export default function ContactStep({
  formData,
  onInputChange,
  errors,
}: StepProps) {
  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <User className="w-5 h-5 mr-2 text-orange-600" />
          Contact Information
        </CardTitle>
        <p className="text-sm text-gray-600">
          We'll use this information to send you order updates and
          confirmations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name *
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              className={`bg-white/60 border-white/40 ${
                errors.firstName ? "border-red-300 focus:border-red-500" : ""
              }`}
              placeholder="Enter your first name"
              required
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name *
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onInputChange("lastName", e.target.value)}
              className={`bg-white/60 border-white/40 ${
                errors.lastName ? "border-red-300 focus:border-red-500" : ""
              }`}
              placeholder="Enter your last name"
              required
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            className={`bg-white/60 border-white/40 ${
              errors.email ? "border-red-300 focus:border-red-500" : ""
            }`}
            placeholder="your.email@example.com"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            className={`bg-white/60 border-white/40 ${
              errors.phone ? "border-red-300 focus:border-red-500" : ""
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            We'll use this for delivery updates and important notifications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
