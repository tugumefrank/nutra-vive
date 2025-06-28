// components/admin/promotions/promotion-form.tsx

import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Calendar,
  Tag,
  Users,
  Target,
  DollarSign,
  Percent,
  Gift,
  Settings,
  Save,
  Loader2,
  Check,
  AlertCircle,
  LucideIcon,
  Clock,
} from "lucide-react";
import {
  IPromotion,
  ICategory,
  IProduct,
  CreatePromotionData,
  UpdatePromotionData,
  PromotionResponse,
  Notification,
} from "@/types/promotions";

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (promotion: IPromotion) => void;
  editingPromotion?: IPromotion | null;
  categories?: ICategory[];
  products?: IProduct[];
  onCreatePromotion?: (data: CreatePromotionData) => Promise<PromotionResponse>;
  onUpdatePromotion?: (
    id: string,
    data: UpdatePromotionData
  ) => Promise<PromotionResponse>;
}

interface FormData {
  // Basic Info
  name: string;
  description: string;
  type: "seasonal" | "custom" | "flash_sale";

  // Discount Configuration
  discountType: "percentage" | "fixed_amount" | "buy_x_get_y";
  discountValue: number;
  buyXGetYConfig: {
    buyQuantity: number;
    getQuantity: number;
    getDiscountPercentage: number;
  };

  // Applicability
  applicabilityScope:
    | "entire_store"
    | "categories"
    | "products"
    | "collections"
    | "customer_segments";
  targetCategories: string[];
  targetProducts: string[];
  targetCollections: string[];
  customerSegments:
    | "new_customers"
    | "returning_customers"
    | "vip_customers"
    | "all";

  // Usage Limits
  usageLimit: string;
  usageLimitPerCustomer: string;

  // Requirements
  minimumPurchaseAmount: string;
  minimumQuantity: string;

  // Exclusions
  excludedCategories: string[];
  excludedProducts: string[];
  excludedCollections: string[];
  excludeDiscountedItems: boolean;

  // Timing
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isScheduled: boolean;
  
  // Duration Settings
  useDuration: boolean;
  durationValue: number;
  durationUnit: "hours" | "days" | "weeks" | "months";

  // Codes
  generateCode: boolean;
  customCodes: string[];

  // Metadata
  tags: string[];
  notes: string;
}

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

export default function PromotionForm({
  isOpen,
  onClose,
  onSuccess,
  editingPromotion,
  categories = [],
  products = [],
  onCreatePromotion,
  onUpdatePromotion,
}: PromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [notification, setNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    name: "",
    description: "",
    type: "custom",

    // Discount Configuration
    discountType: "percentage",
    discountValue: 0,
    buyXGetYConfig: {
      buyQuantity: 1,
      getQuantity: 1,
      getDiscountPercentage: 0,
    },

    // Applicability
    applicabilityScope: "entire_store",
    targetCategories: [],
    targetProducts: [],
    targetCollections: [],
    customerSegments: "all",

    // Usage Limits
    usageLimit: "",
    usageLimitPerCustomer: "",

    // Requirements
    minimumPurchaseAmount: "",
    minimumQuantity: "",

    // Exclusions
    excludedCategories: [],
    excludedProducts: [],
    excludedCollections: [],
    excludeDiscountedItems: false,

    // Timing
    startsAt: "",
    endsAt: "",
    isActive: true,
    isScheduled: false,
    
    // Duration Settings
    useDuration: false,
    durationValue: 1,
    durationUnit: "days",

    // Codes
    generateCode: true,
    customCodes: [],

    // Metadata
    tags: [],
    notes: "",
  });

  const [newTag, setNewTag] = useState<string>("");
  const [newCustomCode, setNewCustomCode] = useState<string>("");

  // Simple notification system
  const showNotification = (type: Notification["type"], message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Initialize form data when editing
  useEffect(() => {
    if (editingPromotion) {
      setFormData({
        name: editingPromotion.name || "",
        description: editingPromotion.description || "",
        type: editingPromotion.type || "custom",
        discountType: editingPromotion.discountType || "percentage",
        discountValue: editingPromotion.discountValue || 0,
        buyXGetYConfig: editingPromotion.buyXGetYConfig || {
          buyQuantity: 1,
          getQuantity: 1,
          getDiscountPercentage: 0,
        },
        applicabilityScope:
          editingPromotion.applicabilityScope || "entire_store",
        targetCategories: editingPromotion.targetCategories || [],
        targetProducts: editingPromotion.targetProducts || [],
        targetCollections: editingPromotion.targetCollections || [],
        customerSegments: editingPromotion.customerSegments || "all",
        usageLimit: editingPromotion.usageLimit?.toString() || "",
        usageLimitPerCustomer:
          editingPromotion.usageLimitPerCustomer?.toString() || "",
        minimumPurchaseAmount:
          editingPromotion.minimumPurchaseAmount?.toString() || "",
        minimumQuantity: editingPromotion.minimumQuantity?.toString() || "",
        excludedCategories: editingPromotion.excludedCategories || [],
        excludedProducts: editingPromotion.excludedProducts || [],
        excludedCollections: editingPromotion.excludedCollections || [],
        excludeDiscountedItems:
          editingPromotion.excludeDiscountedItems || false,
        startsAt: editingPromotion.startsAt
          ? new Date(editingPromotion.startsAt).toISOString().slice(0, 16)
          : "",
        endsAt: editingPromotion.endsAt
          ? new Date(editingPromotion.endsAt).toISOString().slice(0, 16)
          : "",
        isActive: editingPromotion.isActive ?? true,
        isScheduled: editingPromotion.isScheduled || false,
        
        // Duration Settings (default to false for existing promotions)
        useDuration: false,
        durationValue: 1,
        durationUnit: "days",
        generateCode: false,
        customCodes:
          editingPromotion.codes?.map((code) =>
            typeof code === "string" ? code : code.code
          ) || [],
        tags: editingPromotion.tags || [],
        notes: editingPromotion.notes || "",
      });
    } else {
      // Reset form for new promotion
      setFormData({
        name: "",
        description: "",
        type: "custom",
        discountType: "percentage",
        discountValue: 0,
        buyXGetYConfig: {
          buyQuantity: 1,
          getQuantity: 1,
          getDiscountPercentage: 0,
        },
        applicabilityScope: "entire_store",
        targetCategories: [],
        targetProducts: [],
        targetCollections: [],
        customerSegments: "all",
        usageLimit: "",
        usageLimitPerCustomer: "",
        minimumPurchaseAmount: "",
        minimumQuantity: "",
        excludedCategories: [],
        excludedProducts: [],
        excludedCollections: [],
        excludeDiscountedItems: false,
        startsAt: "",
        endsAt: "",
        isActive: true,
        isScheduled: false,
        
        // Duration Settings
        useDuration: false,
        durationValue: 1,
        durationUnit: "days",
        
        generateCode: true,
        customCodes: [],
        tags: [],
        notes: "",
      });
    }
    setCurrentStep(1);
    setNotification(null);
  }, [editingPromotion, isOpen]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parent: keyof FormData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addCustomCode = () => {
    if (
      newCustomCode.trim() &&
      !formData.customCodes.includes(newCustomCode.trim().toUpperCase())
    ) {
      setFormData((prev) => ({
        ...prev,
        customCodes: [...prev.customCodes, newCustomCode.trim().toUpperCase()],
      }));
      setNewCustomCode("");
    }
  };

  const removeCustomCode = (codeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      customCodes: prev.customCodes.filter((code) => code !== codeToRemove),
    }));
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, durationValue: number, durationUnit: string): string => {
    if (!startDate || !durationValue) return "";
    
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (durationUnit) {
      case "hours":
        end.setHours(start.getHours() + durationValue);
        break;
      case "days":
        end.setDate(start.getDate() + durationValue);
        break;
      case "weeks":
        end.setDate(start.getDate() + (durationValue * 7));
        break;
      case "months":
        end.setMonth(start.getMonth() + durationValue);
        break;
      default:
        return "";
    }
    
    return end.toISOString().slice(0, 16);
  };

  // Auto-calculate end date when using duration mode
  useEffect(() => {
    if (formData.useDuration && formData.startsAt && formData.durationValue > 0) {
      const calculatedEndDate = calculateEndDate(
        formData.startsAt,
        formData.durationValue,
        formData.durationUnit
      );
      if (calculatedEndDate !== formData.endsAt) {
        setFormData((prev) => ({
          ...prev,
          endsAt: calculatedEndDate,
        }));
      }
    }
  }, [formData.useDuration, formData.startsAt, formData.durationValue, formData.durationUnit]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showNotification("error", "Promotion name is required");
      return;
    }

    if (!onCreatePromotion && !editingPromotion) {
      showNotification("error", "Create promotion function not provided");
      return;
    }

    if (!onUpdatePromotion && editingPromotion) {
      showNotification("error", "Update promotion function not provided");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData: CreatePromotionData | UpdatePromotionData = {
        ...formData,
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
        usageLimitPerCustomer: formData.usageLimitPerCustomer
          ? parseInt(formData.usageLimitPerCustomer)
          : undefined,
        minimumPurchaseAmount: formData.minimumPurchaseAmount
          ? parseFloat(formData.minimumPurchaseAmount)
          : undefined,
        minimumQuantity: formData.minimumQuantity
          ? parseInt(formData.minimumQuantity)
          : undefined,
      };

      // Call the appropriate server action
      const result =
        editingPromotion && onUpdatePromotion
          ? await onUpdatePromotion(editingPromotion._id, submitData)
          : await onCreatePromotion!(submitData as CreatePromotionData);

      if (result.success && result.promotion) {
        showNotification(
          "success",
          editingPromotion
            ? "Promotion updated successfully!"
            : "Promotion created successfully!"
        );
        setTimeout(() => {
          onSuccess(result.promotion!);
          onClose();
        }, 1000);
      } else {
        showNotification("error", result.error || "Failed to save promotion");
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      showNotification("error", "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: Step[] = [
    { id: 1, title: "Basic Info", icon: Gift },
    { id: 2, title: "Discount", icon: Percent },
    { id: 3, title: "Targeting", icon: Target },
    { id: 4, title: "Timing & Rules", icon: Calendar },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Notification */}
          {notification && (
            <div
              className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : notification.type === "error"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : notification.type === "warning"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
              }`}
            >
              {notification.type === "success" ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPromotion ? "Edit Promotion" : "Create New Promotion"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {editingPromotion
                    ? "Update your promotion details"
                    : "Set up a new promotion to boost sales"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= step.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-400 dark:border-gray-600"
                      }`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          currentStep >= step.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`ml-6 w-20 h-0.5 ${
                          currentStep > step.id
                            ? "bg-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Promotion Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="e.g., Summer Sale 2024"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your promotion..."
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Promotion Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange(
                          "type",
                          e.target.value as FormData["type"]
                        )
                      }
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <option value="seasonal">Seasonal/Event-Based</option>
                      <option value="custom">Custom Promotion</option>
                      <option value="flash_sale">Flash Sale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Internal notes about this promotion..."
                      rows={2}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Discount Configuration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      handleInputChange(
                        "discountType",
                        e.target.value as FormData["discountType"]
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed_amount">Fixed Amount Off</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>

                {formData.discountType === "buy_x_get_y" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Buy Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.buyXGetYConfig.buyQuantity}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "buyXGetYConfig",
                            "buyQuantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Get Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.buyXGetYConfig.getQuantity}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "buyXGetYConfig",
                            "getQuantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.buyXGetYConfig.getDiscountPercentage}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "buyXGetYConfig",
                            "getDiscountPercentage",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Discount Value *{" "}
                      {formData.discountType === "percentage" ? "(%)" : "($)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={
                        formData.discountType === "percentage" ? "1" : "0.01"
                      }
                      max={
                        formData.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        handleInputChange(
                          "discountValue",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder={
                        formData.discountType === "percentage"
                          ? "e.g., 25 for 25%"
                          : "e.g., 10 for $10"
                      }
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        handleInputChange("usageLimit", e.target.value)
                      }
                      placeholder="Leave empty for unlimited"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Limit Per Customer
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimitPerCustomer}
                      onChange={(e) =>
                        handleInputChange(
                          "usageLimitPerCustomer",
                          e.target.value
                        )
                      }
                      placeholder="e.g., 1"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Promotion Codes</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="generateCode"
                        checked={formData.generateCode}
                        onChange={(e) =>
                          handleInputChange("generateCode", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="generateCode" className="text-sm">
                        Auto-generate a promotion code
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Custom Codes
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.customCodes.map((code, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {code}
                            <button
                              type="button"
                              onClick={() => removeCustomCode(code)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomCode}
                          onChange={(e) =>
                            setNewCustomCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter custom code..."
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addCustomCode())
                          }
                        />
                        <button
                          type="button"
                          onClick={addCustomCode}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Targeting */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Apply To *
                  </label>
                  <select
                    value={formData.applicabilityScope}
                    onChange={(e) =>
                      handleInputChange(
                        "applicabilityScope",
                        e.target.value as FormData["applicabilityScope"]
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="entire_store">Entire Store</option>
                    <option value="categories">Specific Categories</option>
                    <option value="products">Specific Products</option>
                    <option value="collections">Collections</option>
                    <option value="customer_segments">Customer Segments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Customer Segment
                  </label>
                  <select
                    value={formData.customerSegments}
                    onChange={(e) =>
                      handleInputChange(
                        "customerSegments",
                        e.target.value as FormData["customerSegments"]
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="all">All Customers</option>
                    <option value="new_customers">New Customers</option>
                    <option value="returning_customers">
                      Returning Customers
                    </option>
                    <option value="vip_customers">VIP Customers</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum Purchase Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumPurchaseAmount}
                      onChange={(e) =>
                        handleInputChange(
                          "minimumPurchaseAmount",
                          e.target.value
                        )
                      }
                      placeholder="e.g., 50"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minimumQuantity}
                      onChange={(e) =>
                        handleInputChange("minimumQuantity", e.target.value)
                      }
                      placeholder="e.g., 2"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="excludeDiscountedItems"
                    checked={formData.excludeDiscountedItems}
                    onChange={(e) =>
                      handleInputChange(
                        "excludeDiscountedItems",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="excludeDiscountedItems" className="text-sm">
                    Exclude already discounted items
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Timing & Rules */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isScheduled"
                    checked={formData.isScheduled}
                    onChange={(e) =>
                      handleInputChange("isScheduled", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isScheduled" className="text-sm font-medium">
                    Schedule this promotion
                  </label>
                </div>

                {formData.isScheduled && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startsAt}
                        onChange={(e) =>
                          handleInputChange("startsAt", e.target.value)
                        }
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>

                    {/* Duration vs End Date Toggle */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        End Date Configuration
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="dateMode"
                              checked={!formData.useDuration}
                              onChange={() => handleInputChange("useDuration", false)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm">Set End Date</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="dateMode"
                              checked={formData.useDuration}
                              onChange={() => handleInputChange("useDuration", true)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm">Set Duration</span>
                          </label>
                        </div>

                        {!formData.useDuration ? (
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              End Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.endsAt}
                              onChange={(e) =>
                                handleInputChange("endsAt", e.target.value)
                              }
                              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Duration
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={formData.durationValue}
                                onChange={(e) =>
                                  handleInputChange("durationValue", parseInt(e.target.value) || 1)
                                }
                                placeholder="e.g., 7"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Unit
                              </label>
                              <select
                                value={formData.durationUnit}
                                onChange={(e) =>
                                  handleInputChange("durationUnit", e.target.value as FormData["durationUnit"])
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              >
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Show calculated end date when using duration */}
                        {formData.useDuration && formData.startsAt && formData.durationValue > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm font-medium">Calculated End Date:</span>
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              {formData.endsAt ? 
                                new Date(formData.endsAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                }) 
                                : "Please set a start date"
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Activate immediately
                  </label>
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h4 className="text-lg font-medium mb-3">
                    Promotion Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">
                        {formData.name || "Untitled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium capitalize">
                        {formData.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="font-medium">
                        {formData.discountType === "percentage"
                          ? `${formData.discountValue}%`
                          : `$${formData.discountValue}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applies to:</span>
                      <span className="font-medium capitalize">
                        {formData.applicabilityScope.replace("_", " ")}
                      </span>
                    </div>
                    {formData.usageLimit && (
                      <div className="flex justify-between">
                        <span>Usage limit:</span>
                        <span className="font-medium">
                          {formData.usageLimit}
                        </span>
                      </div>
                    )}
                    {formData.isScheduled && (
                      <div className="flex justify-between">
                        <span>Schedule:</span>
                        <span className="font-medium">
                          {formData.useDuration 
                            ? `${formData.durationValue} ${formData.durationUnit}`
                            : "Custom dates"
                          }
                        </span>
                      </div>
                    )}
                    {formData.startsAt && (
                      <div className="flex justify-between">
                        <span>Starts:</span>
                        <span className="font-medium text-xs">
                          {new Date(formData.startsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {formData.endsAt && (
                      <div className="flex justify-between">
                        <span>Ends:</span>
                        <span className="font-medium text-xs">
                          {new Date(formData.endsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 dark:bg-gray-800 px-6 py-4 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingPromotion ? "Update Promotion" : "Create Promotion"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
