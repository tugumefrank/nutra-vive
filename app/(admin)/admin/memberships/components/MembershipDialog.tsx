"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Crown,
  Package,
  Star,
  Activity,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Truck,
  Headphones,
  Gift,
  BookOpen,
  Video,
  Percent,
  Settings,
  Palette,
  Save,
  X,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  createMembership,
  updateMembership,
} from "../../../../../lib/actions/membershipServerActions";
import { useMemberships } from "./MembershipsProvider";

// =========================================================
// 1. Zod Schema: Define the shape of data the FORM handles
// =========================================================
const membershipSchema = z.object({
  name: z.string().min(1, "Membership name is required"),
  description: z.string().optional(),
  tier: z.enum(["basic", "premium", "vip", "elite"]),

  // Pricing
  price: z.number().min(0, "Price must be positive"),
  billingFrequency: z.enum(["monthly", "quarterly", "yearly"]),
  currency: z.string().min(1, "Currency is required"),

  // Product Allocations
  productAllocations: z
    .array(
      z.object({
        categoryId: z.string().min(1, "Category is required"),
        categoryName: z.string().min(1, "Category name is required"),
        quantity: z.number().int().min(0, "Quantity must be positive"),
        allowedProducts: z.array(z.string()).optional(),
      })
    )
    .min(1, "At least one product allocation is required"),

  // Custom Benefits
  customBenefits: z
    .array(
      z.object({
        title: z.string().min(1, "Benefit title is required"),
        description: z.string().min(1, "Benefit description is required"),
        type: z.enum(["webinar", "content", "discount", "service", "other"]),
        value: z.string().optional(),
      })
    )
    .default([]),

  // Features
  features: z.array(z.string()).default([]),

  // Configuration
  maxProductsPerMonth: z.number().int().min(0).optional(),
  deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  freeDelivery: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),

  // Display
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type MembershipForm = z.infer<typeof membershipSchema>;

// Helper Interfaces & Constants
interface TierOption {
  value: "basic" | "premium" | "vip" | "elite";
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
}

interface BenefitType {
  value: "webinar" | "content" | "discount" | "service" | "other";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ColorOption {
  value: string;
  label: string;
}

interface Category {
  _id: string;
  name: string;
}

const tierOptions: TierOption[] = [
  { value: "basic", label: "Basic", icon: Package, color: "#3b82f6" },
  { value: "premium", label: "Premium", icon: Star, color: "#8b5cf6" },
  { value: "vip", label: "VIP", icon: Crown, color: "#eab308" },
  { value: "elite", label: "Elite", icon: Activity, color: "#ef4444" },
];

const benefitTypes: BenefitType[] = [
  { value: "webinar", label: "Webinar", icon: Video },
  { value: "content", label: "Content", icon: BookOpen },
  { value: "discount", label: "Discount", icon: Percent },
  { value: "service", label: "Service", icon: Settings },
  { value: "other", label: "Other", icon: Gift },
];

const colorOptions: ColorOption[] = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#eab308", label: "Yellow" },
  { value: "#ef4444", label: "Red" },
  { value: "#10b981", label: "Green" },
  { value: "#f97316", label: "Orange" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#ec4899", label: "Pink" },
];

// Tab to field mapping for error detection
const tabFieldMapping = {
  basic: [
    "name",
    "tier",
    "description",
    "isActive",
    "isPopular",
    "sortOrder",
    "color",
    "icon",
  ],
  pricing: ["price", "billingFrequency", "currency"],
  products: ["productAllocations", "maxProductsPerMonth"],
  benefits: ["customBenefits", "features"],
  settings: ["deliveryFrequency", "freeDelivery", "prioritySupport"],
};

// Helper function to extract ID from various formats
const extractId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    // Handle nested objects like { _id: "...", name: "..." }
    if (value._id) {
      const id = value._id;
      if (typeof id === "string") return id;
      if (id.toHexString && typeof id.toHexString === "function") {
        return id.toHexString();
      }
      return String(id);
    }
    // Handle MongoDB ObjectId directly
    if (value.toHexString && typeof value.toHexString === "function") {
      return value.toHexString();
    }
    // Handle case where the whole object is the ID
    if (value.toString && value.toString() !== "[object Object]") {
      return value.toString();
    }
  }
  return String(value);
};

// Helper function to prepare form data from membership
const prepareFormData = (
  membership: any,
  categories: Category[]
): MembershipForm => {
  // Process product allocations with proper category resolution
  const allocations =
    membership.productAllocations?.map((pa: any) => {
      const categoryId = extractId(pa.categoryId);
      const matchingCategory = categories.find((c) => c._id === categoryId);

      return {
        categoryId,
        categoryName: matchingCategory?.name || pa.categoryName || "",
        quantity: pa.quantity || 0,
        allowedProducts: Array.isArray(pa.allowedProducts)
          ? pa.allowedProducts.map(extractId)
          : [],
      };
    }) || [];

  return {
    name: membership.name || "",
    description: membership.description || "",
    tier: membership.tier || "basic",
    price: membership.price || 0,
    billingFrequency: membership.billingFrequency || "monthly",
    currency: membership.currency || "USD",
    productAllocations: allocations,
    customBenefits: Array.isArray(membership.customBenefits)
      ? membership.customBenefits
      : [],
    features: Array.isArray(membership.features) ? membership.features : [],
    deliveryFrequency: membership.deliveryFrequency || "monthly",
    freeDelivery: membership.freeDelivery || false,
    prioritySupport: membership.prioritySupport || false,
    isActive: membership.isActive !== undefined ? membership.isActive : true,
    isPopular: membership.isPopular || false,
    sortOrder: membership.sortOrder || 0,
    color: membership.color || undefined,
    icon: membership.icon || undefined,
    maxProductsPerMonth: membership.maxProductsPerMonth || undefined,
  };
};

export default function MembershipDialog() {
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedMembership,
    categories,
    refreshMemberships,
  } = useMemberships();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const isOpen = isCreateDialogOpen || isEditDialogOpen;
  const isEditMode = isEditDialogOpen && selectedMembership;

  const form = useForm<MembershipForm>({
    resolver: zodResolver(membershipSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      tier: "basic",
      price: 0,
      billingFrequency: "monthly",
      currency: "USD",
      productAllocations: [],
      customBenefits: [],
      features: [],
      deliveryFrequency: "monthly",
      freeDelivery: false,
      prioritySupport: false,
      isActive: true,
      isPopular: false,
      sortOrder: 0,
      color: undefined,
      icon: undefined,
      maxProductsPerMonth: undefined,
    },
  });

  const {
    fields: allocationFields,
    append: appendAllocation,
    remove: removeAllocation,
  } = useFieldArray({
    control: form.control,
    name: "productAllocations",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control: form.control,
    name: "customBenefits",
  });

  // Single useEffect to handle form reset and category population
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("basic");

    if (isEditMode && selectedMembership && categories?.length > 0) {
      const formData = prepareFormData(selectedMembership, categories);
      form.reset(formData);

      // Ensure Select components get the right values
      setTimeout(() => {
        formData.productAllocations.forEach((allocation, index) => {
          const categoryId = allocation.categoryId;
          if (
            categoryId &&
            typeof categoryId === "string" &&
            categoryId !== "[object Object]"
          ) {
            form.setValue(
              `productAllocations.${index}.categoryId`,
              categoryId,
              { shouldValidate: false, shouldDirty: false }
            );
            form.setValue(
              `productAllocations.${index}.categoryName`,
              allocation.categoryName,
              { shouldValidate: false, shouldDirty: false }
            );
          } else {
            // Try to find the category by name as fallback
            const categoryByName = categories.find(
              (c) => c.name === allocation.categoryName
            );
            if (categoryByName) {
              form.setValue(
                `productAllocations.${index}.categoryId`,
                categoryByName._id,
                { shouldValidate: false, shouldDirty: false }
              );
            }
          }
        });
        form.trigger("productAllocations");
      }, 100);
    } else if (!isEditMode) {
      // Reset to default values for create mode
      form.reset({
        name: "",
        description: "",
        tier: "basic",
        price: 0,
        billingFrequency: "monthly",
        currency: "USD",
        productAllocations: [],
        customBenefits: [],
        features: [],
        deliveryFrequency: "monthly",
        freeDelivery: false,
        prioritySupport: false,
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        color: undefined,
        icon: undefined,
        maxProductsPerMonth: undefined,
      });
    }
  }, [isOpen, isEditMode, selectedMembership, categories, form]);

  // Function to detect which tab has errors
  const getTabWithErrors = (errors: any) => {
    console.log("🔍 Checking errors:", errors);
    
    for (const [tabName, fields] of Object.entries(tabFieldMapping)) {
      const hasErrors = fields.some((field) => {
        if (field.includes(".")) {
          const parts = field.split(".");
          let current = errors;
          for (const part of parts) {
            if (current && current[part]) {
              current = current[part];
            } else {
              return false;
            }
          }
          return true;
        }
        return errors[field];
      });
      
      if (hasErrors) {
        console.log(`🚨 Found errors in tab: ${tabName}`);
        return tabName;
      }
    }

    if (errors.productAllocations) {
      console.log("🚨 Found errors in product allocations");
      return "products";
    }

    console.log("❌ No specific tab errors found");
    return null;
  };

  // Function to get detailed error messages
  const getDetailedErrors = (errors: any): string[] => {
    const errorMessages: string[] = [];
    
    const addErrorMessage = (field: string, message: string) => {
      errorMessages.push(`${field}: ${message}`);
    };
    
    // Check each field for errors
    if (errors.name) addErrorMessage("Name", errors.name.message);
    if (errors.tier) addErrorMessage("Tier", errors.tier.message);
    if (errors.price) addErrorMessage("Price", errors.price.message);
    if (errors.billingFrequency) addErrorMessage("Billing Frequency", errors.billingFrequency.message);
    if (errors.currency) addErrorMessage("Currency", errors.currency.message);
    if (errors.deliveryFrequency) addErrorMessage("Delivery Frequency", errors.deliveryFrequency.message);
    
    // Check product allocations errors
    if (errors.productAllocations) {
      if (errors.productAllocations.message) {
        addErrorMessage("Product Allocations", errors.productAllocations.message);
      } else if (Array.isArray(errors.productAllocations)) {
        errors.productAllocations.forEach((allocationError: any, index: number) => {
          if (allocationError) {
            if (allocationError.categoryId) {
              addErrorMessage(`Allocation ${index + 1} - Category`, allocationError.categoryId.message);
            }
            if (allocationError.quantity) {
              addErrorMessage(`Allocation ${index + 1} - Quantity`, allocationError.quantity.message);
            }
          }
        });
      }
    }
    
    // Check custom benefits errors
    if (errors.customBenefits && Array.isArray(errors.customBenefits)) {
      errors.customBenefits.forEach((benefitError: any, index: number) => {
        if (benefitError) {
          if (benefitError.title) {
            addErrorMessage(`Benefit ${index + 1} - Title`, benefitError.title.message);
          }
          if (benefitError.description) {
            addErrorMessage(`Benefit ${index + 1} - Description`, benefitError.description.message);
          }
          if (benefitError.type) {
            addErrorMessage(`Benefit ${index + 1} - Type`, benefitError.type.message);
          }
        }
      });
    }
    
    return errorMessages;
  };

  const onSubmit = async (data: MembershipForm) => {
    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        color: data.color === "default" ? undefined : data.color,
        productAllocations: data.productAllocations.map((alloc) => ({
          ...alloc,
          allowedProducts: alloc.allowedProducts ?? [],
        })),
      };

      let result;

      if (isEditMode && selectedMembership) {
        result = await updateMembership(selectedMembership._id, submitData);
        if (result.success) {
          toast.success("Membership updated successfully");
          setIsEditDialogOpen(false);
          refreshMemberships();
        } else {
          toast.error(result.error || "Failed to update membership");
        }
      } else {
        result = await createMembership(submitData);
        if (result.success) {
          toast.success("Membership created successfully");
          setIsCreateDialogOpen(false);
          refreshMemberships();
        } else {
          toast.error(result.error || "Failed to create membership");
        }
      }
    } catch (error) {
      const formErrors = form.formState.errors;
      const errorTab = getTabWithErrors(formErrors);

      if (errorTab && errorTab !== activeTab) {
        setActiveTab(errorTab);
        toast.error(
          `Please check the "${errorTab}" tab for validation errors`,
          {
            icon: <AlertCircle className="h-4 w-4" />,
            duration: 4000,
          }
        );
      } else {
        toast.error("Please fix the validation errors before submitting");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    console.log("🚨 Form validation failed:", errors);
    
    const detailedErrors = getDetailedErrors(errors);
    const errorTab = getTabWithErrors(errors);
    
    // Show detailed error messages
    if (detailedErrors.length > 0) {
      console.log("📋 Detailed errors:", detailedErrors);
      
      // Create a detailed error message
      const errorMessage = detailedErrors.length > 3 
        ? `${detailedErrors.slice(0, 3).join(", ")} and ${detailedErrors.length - 3} more errors`
        : detailedErrors.join(", ");
      
      toast.error(
        `Validation errors: ${errorMessage}`,
        {
          icon: <AlertCircle className="h-4 w-4" />,
          duration: 6000,
        }
      );
    }
    
    // Navigate to the tab with errors
    if (errorTab && errorTab !== activeTab) {
      setActiveTab(errorTab);
      toast.error(`Please check the "${errorTab}" section for errors`, {
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 4000,
      });
    } else if (!errorTab) {
      toast.error("Please fix the validation errors before submitting");
    }
  });

  const handleClose = () => {
    if (isEditMode) {
      setIsEditDialogOpen(false);
    } else {
      setIsCreateDialogOpen(false);
    }
  };

  const addAllocation = () => {
    appendAllocation({
      categoryId: "",
      categoryName: "",
      quantity: 1,
      allowedProducts: [],
    });
  };

  const addBenefit = () => {
    appendBenefit({
      title: "",
      description: "",
      type: "other",
      value: "",
    });
  };

  const handleAddFeatureInput = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && event.currentTarget.value.trim()) {
      addFeature(event.currentTarget.value.trim());
      event.currentTarget.value = "";
    }
  };

  const addFeature = (feature: string) => {
    if (feature.trim()) {
      form.setValue(
        "features",
        [...form.getValues("features"), feature.trim()],
        { shouldValidate: true, shouldDirty: true }
      );
    }
  };

  const removeFeature = (index: number): void => {
    const features = form.getValues("features");
    const updated = [...features.slice(0, index), ...features.slice(index + 1)];
    form.setValue("features", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const selectedTier = form.watch("tier");
  const selectedTierOption = tierOptions.find(
    (option) => option.value === selectedTier
  );
  const TierIcon = selectedTierOption?.icon || Package;

  // Helper function to check if a section is complete
  const isSectionComplete = (section: string): boolean => {
    const formValues = form.getValues();
    const errors = form.formState.errors;
    
    switch (section) {
      case "basic":
        return !!(formValues.name && formValues.tier && !errors.name && !errors.tier);
      case "pricing":
        return !!(formValues.price > 0 && formValues.billingFrequency && formValues.currency && !errors.price);
      case "products":
        return !!(formValues.productAllocations?.length > 0 && !errors.productAllocations);
      case "benefits":
        return true; // Benefits are optional
      case "settings":
        return !!(formValues.deliveryFrequency && !errors.deliveryFrequency);
      default:
        return false;
    }
  };

  // Tab configuration with icons and descriptions
  const tabConfig = [
    { 
      id: "basic", 
      label: "Basic Info", 
      icon: Settings, 
      description: "Name, tier, and basic settings",
      required: true
    },
    { 
      id: "pricing", 
      label: "Pricing", 
      icon: DollarSign, 
      description: "Price and billing configuration",
      required: true
    },
    { 
      id: "products", 
      label: "Products", 
      icon: Package, 
      description: "Product allocations and limits",
      required: true
    },
    { 
      id: "benefits", 
      label: "Benefits", 
      icon: Gift, 
      description: "Custom benefits and features",
      required: false
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Truck, 
      description: "Delivery and support options",
      required: true
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-4 sm:px-6">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="truncate">
              {isEditMode ? "Edit Membership" : "Create New Membership"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="mx-4 sm:mx-6 mb-4">
                <div className="grid grid-cols-5 gap-2">
                  {tabConfig.map((tab) => {
                    const TabIcon = tab.icon;
                    const isComplete = isSectionComplete(tab.id);
                    const isActive = activeTab === tab.id;
                    
                    // Check if this tab has errors
                    const formErrors = form.formState.errors;
                    const hasErrors = Object.entries(tabFieldMapping).some(([tabName, fields]) => {
                      if (tabName === tab.id) {
                        return fields.some((field) => {
                          if (field.includes(".")) {
                            const parts = field.split(".");
                            let current = formErrors;
                            for (const part of parts) {
                              if (current && current[part]) {
                                current = current[part];
                              } else {
                                return false;
                              }
                            }
                            return true;
                          }
                          return formErrors[field];
                        });
                      }
                      return false;
                    });
                    
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`p-3 rounded-lg border text-xs flex flex-col items-center gap-2 transition-colors relative ${
                          isActive 
                            ? "bg-primary/10 border-primary/20 text-primary" 
                            : hasErrors
                            ? "bg-red-50 border-red-200 hover:bg-red-100"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <TabIcon className={`h-4 w-4 ${hasErrors ? "text-red-600" : ""}`} />
                        <span className={`font-medium ${hasErrors ? "text-red-700" : ""}`}>
                          {tab.label}
                        </span>
                        {hasErrors && (
                          <AlertCircle className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                        )}
                        {isComplete && !hasErrors && (
                          <Check className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden mx-4 sm:mx-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Form Progress
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {showPreview ? "Hide" : "Preview"}
                  </Button>
                </div>
                {tabConfig.map((tab, index) => {
                  const TabIcon = tab.icon;
                  const isComplete = isSectionComplete(tab.id);
                  const isActive = activeTab === tab.id;
                  
                  // Check if this tab has errors
                  const formErrors = form.formState.errors;
                  const hasErrors = Object.entries(tabFieldMapping).some(([tabName, fields]) => {
                    if (tabName === tab.id) {
                      return fields.some((field) => {
                        if (field.includes(".")) {
                          const parts = field.split(".");
                          let current = formErrors;
                          for (const part of parts) {
                            if (current && current[part]) {
                              current = current[part];
                            } else {
                              return false;
                            }
                          }
                          return true;
                        }
                        return formErrors[field];
                      });
                    }
                    return false;
                  });
                  
                  return (
                    <div key={tab.id} className={`border rounded-lg ${hasErrors ? "border-red-300 bg-red-50/50" : ""}`}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                          isActive 
                            ? "bg-primary/5 border-primary/20" 
                            : hasErrors
                            ? "hover:bg-red-100/50"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${
                            isActive 
                              ? "bg-primary/10" 
                              : hasErrors
                              ? "bg-red-100"
                              : "bg-muted"
                          }`}>
                            <TabIcon className={`h-4 w-4 ${
                              isActive 
                                ? "text-primary" 
                                : hasErrors
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${
                                isActive 
                                  ? "text-primary" 
                                  : hasErrors
                                  ? "text-red-700"
                                  : ""
                              }`}>
                                {tab.label}
                              </span>
                              {tab.required && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                              {hasErrors && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              {isComplete && !hasErrors && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className={`text-xs ${
                              hasErrors ? "text-red-600" : "text-muted-foreground"
                            }`}>
                              {hasErrors ? "Please fix validation errors" : tab.description}
                            </p>
                          </div>
                        </div>
                        {isActive ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            
            {/* Error Summary Panel */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="mx-4 sm:mx-6 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 mb-2">
                        Please fix the following validation errors:
                      </h4>
                      <ul className="space-y-1 text-sm text-red-700">
                        {getDetailedErrors(form.formState.errors).map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Mobile Preview */}
              {showPreview && (
                <div className="lg:hidden mx-4 sm:mx-6 mb-4">
                  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <TierIcon
                            className="h-6 w-6"
                            style={{ color: selectedTierOption?.color || "#3b82f6" }}
                          />
                          <h3 className="text-lg font-semibold">
                            {form.watch("name") || "Membership Name"}
                          </h3>
                          {form.watch("isPopular") && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-2xl font-bold">
                          ${form.watch("price") || 0}
                          <span className="text-sm text-muted-foreground">
                            /{form.watch("billingFrequency") || "monthly"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {form.watch("description") || "No description provided"}
                        </div>
                        {form.watch("features")?.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {form.watch("features")?.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {form.watch("features")?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{form.watch("features")?.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <ScrollArea className="h-[400px] sm:h-[500px] px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6 py-4">
                  {/* Basic Information Tab */}
                  {activeTab === "basic" && (
                    <div className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Basic Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Membership Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., VIP Premium Plan"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="tier"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tier</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select tier" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {tierOptions.map((tier) => (
                                        <SelectItem
                                          key={tier.value}
                                          value={tier.value}
                                        >
                                          <div className="flex items-center gap-2">
                                            <tier.icon
                                              className="h-4 w-4"
                                              style={{ color: tier.color }}
                                            />
                                            {tier.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe what this membership includes..."
                                    className="resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-sm sm:text-base">
                                      Active
                                    </FormLabel>
                                    <FormDescription className="text-xs sm:text-sm">
                                      Allow users to subscribe
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="isPopular"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-sm sm:text-base flex items-center gap-1">
                                      <Sparkles className="h-4 w-4" />
                                      Popular
                                    </FormLabel>
                                    <FormDescription className="text-xs sm:text-sm">
                                      Highlight this plan
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="sortOrder"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sort Order</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs sm:text-sm">
                                    Lower numbers appear first
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="color"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Palette className="h-4 w-4" />
                                    Card Color
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a color" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {colorOptions.map((color) => (
                                        <SelectItem
                                          key={color.value}
                                          value={color.value}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="h-4 w-4 rounded-full"
                                              style={{
                                                backgroundColor: color.value,
                                              }}
                                            />
                                            {color.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Visual color for the membership card.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="icon"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Crown className="h-4 w-4" />
                                    Icon Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Crown, Package"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Name of a Lucide React icon. (Optional)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    </div>
                  )}

                  {/* Pricing Tab */}
                  {activeTab === "pricing" && (
                    <div className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Pricing Configuration
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price (USD)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="pl-10"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="billingFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Billing Frequency</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="monthly">
                                        Monthly
                                      </SelectItem>
                                      <SelectItem value="quarterly">
                                        Quarterly
                                      </SelectItem>
                                      <SelectItem value="yearly">
                                        Yearly
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="currency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., USD" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Price Preview */}
                          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                            <CardContent className="p-6">
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  <TierIcon
                                    className="h-6 w-6"
                                    style={{ color: selectedTierOption?.color }}
                                  />
                                  <h3 className="text-xl font-semibold">
                                    {form.watch("name") || "Membership Name"}
                                  </h3>
                                </div>
                                <div className="text-3xl font-bold">
                                  ${form.watch("price") || 0}
                                  <span className="text-lg text-muted-foreground">
                                    /{form.watch("billingFrequency")}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CardContent>
                      </Card>
                    </motion.div>
                    </div>
                  )}

                  {/* Product Allocations Tab - CLEANED UP */}
                  {activeTab === "products" && (
                    <div className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Allocations
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Define how many products from each category members
                            can select
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {!categories || categories.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span className="text-muted-foreground">
                                  Loading categories...
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <AnimatePresence>
                                {allocationFields.map((field, index) => {
                                  const currentCategoryId = form.watch(
                                    `productAllocations.${index}.categoryId`
                                  );
                                  const currentCategoryName = form.watch(
                                    `productAllocations.${index}.categoryName`
                                  );

                                  return (
                                    <motion.div
                                      key={field.id}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="p-4 border rounded-lg space-y-4"
                                    >
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">
                                          Allocation {index + 1}
                                        </h4>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeAllocation(index)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>


                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <FormField
                                          control={form.control}
                                          name={`productAllocations.${index}.categoryId`}
                                          render={({
                                            field: categoryField,
                                          }) => (
                                            <FormItem>
                                              <FormLabel>Category</FormLabel>
                                              <Select
                                                key={`category-${index}-${currentCategoryId}`} // Force re-render when value changes
                                                onValueChange={(value) => {
                                                  categoryField.onChange(value);
                                                  const category = categories.find(
                                                    (c: Category) => c._id === value
                                                  );
                                                  if (category) {
                                                    form.setValue(
                                                      `productAllocations.${index}.categoryName`,
                                                      category.name,
                                                      { shouldValidate: true }
                                                    );
                                                  }
                                                }}
                                                value={
                                                  categoryField.value &&
                                                  typeof categoryField.value ===
                                                    "string" &&
                                                  categoryField.value !==
                                                    "[object Object]"
                                                    ? categoryField.value
                                                    : ""
                                                }
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select category">
                                                      {currentCategoryName ||
                                                        "Select category"}
                                                    </SelectValue>
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  {categories.map(
                                                    (category) => (
                                                      <SelectItem
                                                        key={category._id}
                                                        value={category._id}
                                                      >
                                                        {category.name}
                                                      </SelectItem>
                                                    )
                                                  )}
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={form.control}
                                          name={`productAllocations.${index}.quantity`}
                                          render={({
                                            field: quantityField,
                                          }) => (
                                            <FormItem>
                                              <FormLabel>Quantity</FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="number"
                                                  min="0"
                                                  placeholder="1"
                                                  {...quantityField}
                                                  onChange={(e) =>
                                                    quantityField.onChange(
                                                      parseInt(
                                                        e.target.value
                                                      ) || 0
                                                    )
                                                  }
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <FormField
                                        control={form.control}
                                        name={`productAllocations.${index}.allowedProducts`}
                                        render={({
                                          field: allowedProductsField,
                                        }) => (
                                          <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                              <Package className="h-4 w-4" />
                                              Specific Products (Optional)
                                            </FormLabel>
                                            <FormControl>
                                              <div className="space-y-2">
                                                <Textarea
                                                  placeholder="Enter product IDs separated by commas (e.g., product-1, product-2)"
                                                  value={
                                                    allowedProductsField.value?.join(", ") || ""
                                                  }
                                                  onChange={(e) => {
                                                    const productIds = e.target.value
                                                      .split(",")
                                                      .map((id) => id.trim())
                                                      .filter((id) => id !== "");
                                                    allowedProductsField.onChange(productIds);
                                                  }}
                                                  className="resize-none h-20"
                                                />
                                                {allowedProductsField.value?.length > 0 && (
                                                  <div className="flex flex-wrap gap-1">
                                                    {allowedProductsField.value.map((productId, idx) => (
                                                      <Badge 
                                                        key={idx} 
                                                        variant="outline" 
                                                        className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                                        onClick={() => {
                                                          const updated = allowedProductsField.value?.filter((_, i) => i !== idx) || [];
                                                          allowedProductsField.onChange(updated);
                                                        }}
                                                      >
                                                        {productId}
                                                        <X className="h-3 w-3 ml-1" />
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </FormControl>
                                            <FormDescription>
                                              Leave empty to allow all products from this category. 
                                              Specify product IDs to limit selection to specific products.
                                            </FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>

                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={addAllocation}
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Product
                                Allocation
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Monthly Product Limit
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Set a maximum number of products a member can
                            receive per month, across all categories. Leave
                            empty for no limit.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <FormField
                            control={form.control}
                            name="maxProductsPerMonth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Products Per Month</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 5"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      field.onChange(
                                        val === ""
                                          ? undefined
                                          : parseInt(val) || 0
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                    </div>
                  )}

                  {/* Custom Benefits Tab */}
                  {activeTab === "benefits" && (
                    <div className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Custom Benefits
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Define unique advantages for this membership tier.
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <AnimatePresence>
                            {benefitFields.map((field, index) => (
                              <motion.div
                                key={field.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 border rounded-lg space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">
                                    Benefit {index + 1}
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBenefit(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`customBenefits.${index}.title`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="e.g., Exclusive Webinar Access"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`customBenefits.${index}.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {benefitTypes.map((type) => (
                                              <SelectItem
                                                key={type.value}
                                                value={type.value}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <type.icon className="h-4 w-4" />
                                                  {type.label}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name={`customBenefits.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Detailed explanation of the benefit..."
                                          className="resize-none"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`customBenefits.${index}.value`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Value (Optional)</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g., 20% OFF, Q1 2024"
                                          {...field}
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Additional context or value for the
                                        benefit.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={addBenefit}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Custom Benefit
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Key Features
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            List main features or selling points of this
                            membership.
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Add Feature</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Type a feature and press Enter"
                                    onKeyDown={handleAddFeatureInput}
                                  />
                                </FormControl>
                                <FormMessage />
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <AnimatePresence>
                                    {field.value?.map((feature, index) => (
                                      <motion.div
                                        key={feature + index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Badge
                                          variant="secondary"
                                          className="flex items-center gap-1 pr-1 cursor-pointer"
                                          onClick={() => removeFeature(index)}
                                        >
                                          {feature}
                                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </Badge>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </div>
                                <FormDescription>
                                  Press Enter to add. Click a tag to remove.
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <div className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Advanced Settings
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Configure delivery, support, and other options.
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="deliveryFrequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Truck className="h-4 w-4" />
                                  Delivery Frequency
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select delivery frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="weekly">
                                      Weekly
                                    </SelectItem>
                                    <SelectItem value="bi-weekly">
                                      Bi-Weekly
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                      Monthly
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  How often products are delivered or access is
                                  refreshed.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="freeDelivery"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm sm:text-base flex items-center gap-1">
                                    <Truck className="h-4 w-4" />
                                    Free Delivery
                                  </FormLabel>
                                  <FormDescription className="text-xs sm:text-sm">
                                    Members receive free delivery on all orders.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="prioritySupport"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm sm:text-base flex items-center gap-1">
                                    <Headphones className="h-4 w-4" />
                                    Priority Support
                                  </FormLabel>
                                  <FormDescription className="text-xs sm:text-sm">
                                    Members get expedited customer support.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Dialog Footer with Save Button */}
              <div className="flex justify-end p-4 sm:p-6 border-t pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {isEditMode ? "Save Changes" : "Create Membership"}
                    </span>
                  )}
                </Button>
              </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
