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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMemberships } from "./MembershipsProvider";
import {
  createMembership,
  updateMembership,
} from "@/lib/actions/membershipServerActions";

const membershipSchema = z.object({
  name: z.string().min(1, "Membership name is required"),
  description: z.string().optional(),
  tier: z.enum(["basic", "premium", "vip", "elite"]),

  // Pricing
  price: z.number().min(0, "Price must be positive"),
  billingFrequency: z.enum(["monthly", "quarterly", "yearly"]),

  // Product Allocations
  productAllocations: z
    .array(
      z.object({
        categoryId: z.string().refine((val) => val !== "none", {
          message: "Category is required",
        }),
        categoryName: z.string().min(1, "Category name is required"),
        quantity: z.number().min(0, "Quantity must be positive"),
        allowedProducts: z.array(z.string()),
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
  maxProductsPerMonth: z.number().min(0).optional(),
  deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  freeDelivery: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),

  // Display
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type MembershipForm = z.infer<typeof membershipSchema>;

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

  const isOpen = isCreateDialogOpen || isEditDialogOpen;
  const isEditMode = isEditDialogOpen && selectedMembership;

  const form = useForm<MembershipForm>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      description: "",
      tier: "basic",
      price: 0,
      billingFrequency: "monthly",
      productAllocations: [],
      customBenefits: [],
      features: [],
      deliveryFrequency: "monthly",
      freeDelivery: false,
      prioritySupport: false,
      isActive: true,
      isPopular: false,
      sortOrder: 0,
      color: "default",
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

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // Reset form when dialog opens/closes or membership changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("basic");

      if (isEditMode) {
        // Populate form with existing membership data
        form.reset({
          name: selectedMembership.name || "",
          description: selectedMembership.description || "",
          tier: selectedMembership.tier || "basic",
          price: selectedMembership.price || 0,
          billingFrequency: selectedMembership.billingFrequency || "monthly",
          productAllocations: selectedMembership.productAllocations || [],
          customBenefits: selectedMembership.customBenefits || [],
          features: selectedMembership.features || [],
          deliveryFrequency: selectedMembership.deliveryFrequency || "monthly",
          freeDelivery: selectedMembership.freeDelivery || false,
          prioritySupport: selectedMembership.prioritySupport || false,
          isActive:
            selectedMembership.isActive !== undefined
              ? selectedMembership.isActive
              : true,
          isPopular: selectedMembership.isPopular || false,
          sortOrder: selectedMembership.sortOrder || 0,
          color: selectedMembership.color || "default",
          icon: selectedMembership.icon || undefined,
          maxProductsPerMonth:
            selectedMembership.maxProductsPerMonth || undefined,
        });
      } else {
        // Reset to default values for create
        form.reset({
          name: "",
          description: "",
          tier: "basic",
          price: 0,
          billingFrequency: "monthly",
          productAllocations: [],
          customBenefits: [],
          features: [],
          deliveryFrequency: "monthly",
          freeDelivery: false,
          prioritySupport: false,
          isActive: true,
          isPopular: false,
          sortOrder: 0,
          color: "default",
          icon: undefined,
          maxProductsPerMonth: undefined,
        });
      }
    }
  }, [isOpen, isEditMode, selectedMembership, form]);

  const onSubmit = async (data: MembershipForm) => {
    setIsLoading(true);
    try {
      // Transform data before sending to server
      const submitData = {
        ...data,
        color: data.color === "default" ? undefined : data.color,
      };

      let result;

      if (isEditMode) {
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
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isEditMode) {
      setIsEditDialogOpen(false);
    } else {
      setIsCreateDialogOpen(false);
    }
  };

  const addAllocation = () => {
    appendAllocation({
      categoryId: "none",
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

  const addFeature = (feature: string) => {
    if (feature.trim()) {
      appendFeature(feature.trim());
    }
  };

  const selectedTier = form.watch("tier");
  const selectedTierOption = tierOptions.find(
    (option) => option.value === selectedTier
  );
  const TierIcon = selectedTierOption?.icon || Package;

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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-5 mx-4 sm:mx-6">
                <TabsTrigger value="basic" className="text-xs">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs">
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="products" className="text-xs">
                  Products
                </TabsTrigger>
                <TabsTrigger value="benefits" className="text-xs">
                  Benefits
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  Settings
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] sm:h-[500px] px-4 sm:px-6">
                <div className="space-y-4 sm:space-y-6 py-4">
                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6 mt-0">
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
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Pricing Tab */}
                  <TabsContent value="pricing" className="space-y-6 mt-0">
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
                  </TabsContent>

                  {/* Product Allocations Tab */}
                  <TabsContent value="products" className="space-y-6 mt-0">
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
                          <AnimatePresence>
                            {allocationFields.map((field, index) => (
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
                                    onClick={() => removeAllocation(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`productAllocations.${index}.categoryId`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                          onValueChange={(value) => {
                                            if (value !== "none") {
                                              field.onChange(value);
                                              const category = categories.find(
                                                (c: Category) => c._id === value
                                              );
                                              if (category) {
                                                form.setValue(
                                                  `productAllocations.${index}.categoryName`,
                                                  category.name
                                                );
                                              }
                                            } else {
                                              field.onChange("");
                                              form.setValue(
                                                `productAllocations.${index}.categoryName`,
                                                ""
                                              );
                                            }
                                          }}
                                          value={field.value || "none"}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="none">
                                              Select a category
                                            </SelectItem>
                                            {categories.map(
                                              (category: Category) => (
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
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            placeholder="1"
                                            {...field}
                                            onChange={(e) =>
                                              field.onChange(
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={addAllocation}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product Allocation
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Benefits Tab */}
                  <TabsContent value="benefits" className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Custom Benefits */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Custom Benefits
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Add special perks like webinars, exclusive content,
                            or services
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
                                    name={`customBenefits.${index}.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                          onValueChange={(value) => {
                                            if (value !== "none") {
                                              field.onChange(value);
                                            } else {
                                              field.onChange("other");
                                            }
                                          }}
                                          value={field.value || "other"}
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

                                  <FormField
                                    control={form.control}
                                    name={`customBenefits.${index}.title`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="e.g., Monthly Health Webinar"
                                            {...field}
                                          />
                                        </FormControl>
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
                                          placeholder="Describe this benefit..."
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
                                          placeholder="e.g., 20% off, Free shipping"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormDescription className="text-xs sm:text-sm">
                                        Additional value information like
                                        discount amounts
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
                            onClick={addBenefit}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Custom Benefit
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Features */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Features</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            List the key features of this membership
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            {featureFields.map((field, index) => (
                              <div
                                key={field.id}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={form.watch(`features.${index}`) || ""}
                                  onChange={(e) =>
                                    form.setValue(
                                      `features.${index}`,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter feature"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFeature(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addFeature("")}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Feature
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6 mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configuration
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="deliveryFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Delivery Frequency</FormLabel>
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
                                      <SelectItem value="weekly">
                                        Weekly
                                      </SelectItem>
                                      <SelectItem value="bi-weekly">
                                        Bi-weekly
                                      </SelectItem>
                                      <SelectItem value="monthly">
                                        Monthly
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="maxProductsPerMonth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Max Products/Month (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="No limit"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseInt(e.target.value) || undefined
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs sm:text-sm">
                                    Leave empty for no limit
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="freeDelivery"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-sm sm:text-base flex items-center gap-2">
                                      <Truck className="h-4 w-4" />
                                      Free Delivery
                                    </FormLabel>
                                    <FormDescription className="text-xs sm:text-sm">
                                      Include free delivery
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
                                    <FormLabel className="text-sm sm:text-base flex items-center gap-2">
                                      <Headphones className="h-4 w-4" />
                                      Priority Support
                                    </FormLabel>
                                    <FormDescription className="text-xs sm:text-sm">
                                      Provide priority customer support
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
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Display Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Theme Color (Optional)</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || "default"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select color" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="default">
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-transparent" />
                                        Default
                                      </div>
                                    </SelectItem>
                                    {colorOptions.map((color) => (
                                      <SelectItem
                                        key={color.value}
                                        value={color.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-4 h-4 rounded-full border"
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Icon (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., crown, star, diamond"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs sm:text-sm">
                                  Icon name for display purposes
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  Tab{" "}
                  {[
                    "basic",
                    "pricing",
                    "products",
                    "benefits",
                    "settings",
                  ].indexOf(activeTab) + 1}{" "}
                  of 5
                </Badge>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Membership"
                      : "Create Membership"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
