// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useForm, useFieldArray, Control } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "sonner";
// import {
//   Crown,
//   Package,
//   Star,
//   Activity,
//   Plus,
//   Trash2,
//   DollarSign,
//   Calendar,
//   Truck,
//   Headphones,
//   Gift,
//   BookOpen,
//   Video,
//   Percent,
//   Settings,
//   Palette,
//   Save,
//   X,
//   Sparkles,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { useMemberships } from "./MembershipsProvider";
// import {
//   createMembership,
//   updateMembership,
// } from "@/lib/actions/membershipServerActions";

// const membershipSchema = z.object({
//   name: z.string().min(1, "Membership name is required"),
//   description: z.string().optional(),
//   tier: z.enum(["basic", "premium", "vip", "elite"]),

//   // Pricing
//   price: z.number().min(0, "Price must be positive"),
//   billingFrequency: z.enum(["monthly", "quarterly", "yearly"]),

//   // Product Allocations
//   productAllocations: z
//     .array(
//       z.object({
//         categoryId: z.string().refine((val) => val !== "none", {
//           message: "Category is required",
//         }),
//         categoryName: z.string().min(1, "Category name is required"),
//         quantity: z.number().min(0, "Quantity must be positive"),
//         allowedProducts: z.array(z.string()).default([]),
//       })
//     )
//     .min(1, "At least one product allocation is required"),

//   // Custom Benefits
//   customBenefits: z
//     .array(
//       z.object({
//         title: z.string().min(1, "Benefit title is required"),
//         description: z.string().min(1, "Benefit description is required"),
//         type: z.enum(["webinar", "content", "discount", "service", "other"]),
//         value: z.string().optional(),
//       })
//     )
//     .default([]),

//   // Features
//   features: z.array(z.string()).default([]),

//   // Configuration
//   maxProductsPerMonth: z.number().min(0).optional(),
//   deliveryFrequency: z.enum(["weekly", "bi-weekly", "monthly"]),
//   freeDelivery: z.boolean().default(false),
//   prioritySupport: z.boolean().default(false),

//   // Display
//   isActive: z.boolean().default(true),
//   isPopular: z.boolean().default(false),
//   sortOrder: z.number().default(0),
//   color: z.string().optional(),
//   icon: z.string().optional(),
// });

// type MembershipForm = z.infer<typeof membershipSchema>;

// interface TierOption {
//   value: "basic" | "premium" | "vip" | "elite";
//   label: string;
//   icon: React.ComponentType<{
//     className?: string;
//     style?: React.CSSProperties;
//   }>;
//   color: string;
// }

// interface BenefitType {
//   value: "webinar" | "content" | "discount" | "service" | "other";
//   label: string;
//   icon: React.ComponentType<{ className?: string }>;
// }

// interface ColorOption {
//   value: string;
//   label: string;
// }

// interface Category {
//   _id: string;
//   name: string;
// }

// const tierOptions: TierOption[] = [
//   { value: "basic", label: "Basic", icon: Package, color: "#3b82f6" },
//   { value: "premium", label: "Premium", icon: Star, color: "#8b5cf6" },
//   { value: "vip", label: "VIP", icon: Crown, color: "#eab308" },
//   { value: "elite", label: "Elite", icon: Activity, color: "#ef4444" },
// ];

// const benefitTypes: BenefitType[] = [
//   { value: "webinar", label: "Webinar", icon: Video },
//   { value: "content", label: "Content", icon: BookOpen },
//   { value: "discount", label: "Discount", icon: Percent },
//   { value: "service", label: "Service", icon: Settings },
//   { value: "other", label: "Other", icon: Gift },
// ];

// const colorOptions: ColorOption[] = [
//   { value: "#3b82f6", label: "Blue" },
//   { value: "#8b5cf6", label: "Purple" },
//   { value: "#eab308", label: "Yellow" },
//   { value: "#ef4444", label: "Red" },
//   { value: "#10b981", label: "Green" },
//   { value: "#f97316", label: "Orange" },
//   { value: "#6366f1", label: "Indigo" },
//   { value: "#ec4899", label: "Pink" },
// ];

// export default function MembershipDialog() {
//   const {
//     isCreateDialogOpen,
//     setIsCreateDialogOpen,
//     isEditDialogOpen,
//     setIsEditDialogOpen,
//     selectedMembership,
//     categories,
//     refreshMemberships,
//   } = useMemberships();

//   const [isLoading, setIsLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");

//   const isOpen = isCreateDialogOpen || isEditDialogOpen;
//   const isEditMode = isEditDialogOpen && selectedMembership;

//   const form = useForm<MembershipForm>({
//     resolver: zodResolver(membershipSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       tier: "basic",
//       price: 0,
//       billingFrequency: "monthly",
//       productAllocations: [],
//       customBenefits: [],
//       features: [],
//       deliveryFrequency: "monthly",
//       freeDelivery: false,
//       prioritySupport: false,
//       isActive: true,
//       isPopular: false,
//       sortOrder: 0,
//       color: "default",
//       icon: undefined,
//       maxProductsPerMonth: undefined,
//     },
//   });

//   const {
//     fields: allocationFields,
//     append: appendAllocation,
//     remove: removeAllocation,
//   } = useFieldArray({
//     control: form.control,
//     name: "productAllocations",
//   });

//   const {
//     fields: benefitFields,
//     append: appendBenefit,
//     remove: removeBenefit,
//   } = useFieldArray({
//     control: form.control,
//     name: "customBenefits",
//   });

//   const {
//     fields: featureFields,
//     append: appendFeature,
//     remove: removeFeature,
//   } = useFieldArray({
//     control: form.control,
//     name: "features",
//   });

//   // Reset form when dialog opens/closes or membership changes
//   useEffect(() => {
//     if (isOpen) {
//       setActiveTab("basic");

//       if (isEditMode) {
//         // Populate form with existing membership data
//         form.reset({
//           name: selectedMembership.name || "",
//           description: selectedMembership.description || "",
//           tier: selectedMembership.tier || "basic",
//           price: selectedMembership.price || 0,
//           billingFrequency: selectedMembership.billingFrequency || "monthly",
//           productAllocations: selectedMembership.productAllocations || [],
//           customBenefits: selectedMembership.customBenefits || [],
//           features: selectedMembership.features || [],
//           deliveryFrequency: selectedMembership.deliveryFrequency || "monthly",
//           freeDelivery: selectedMembership.freeDelivery || false,
//           prioritySupport: selectedMembership.prioritySupport || false,
//           isActive:
//             selectedMembership.isActive !== undefined
//               ? selectedMembership.isActive
//               : true,
//           isPopular: selectedMembership.isPopular || false,
//           sortOrder: selectedMembership.sortOrder || 0,
//           color: selectedMembership.color || "default",
//           icon: selectedMembership.icon || undefined,
//           maxProductsPerMonth:
//             selectedMembership.maxProductsPerMonth || undefined,
//         });
//       } else {
//         // Reset to default values for create
//         form.reset({
//           name: "",
//           description: "",
//           tier: "basic",
//           price: 0,
//           billingFrequency: "monthly",
//           productAllocations: [],
//           customBenefits: [],
//           features: [],
//           deliveryFrequency: "monthly",
//           freeDelivery: false,
//           prioritySupport: false,
//           isActive: true,
//           isPopular: false,
//           sortOrder: 0,
//           color: "default",
//           icon: undefined,
//           maxProductsPerMonth: undefined,
//         });
//       }
//     }
//   }, [isOpen, isEditMode, selectedMembership, form]);

//   const onSubmit = async (data: MembershipForm) => {
//     setIsLoading(true);
//     try {
//       // Transform data before sending to server
//       const submitData = {
//         ...data,
//         color: data.color === "default" ? undefined : data.color,
//       };

//       let result;

//       if (isEditMode) {
//         result = await updateMembership(selectedMembership._id, submitData);
//         if (result.success) {
//           toast.success("Membership updated successfully");
//           setIsEditDialogOpen(false);
//           refreshMemberships();
//         } else {
//           toast.error(result.error || "Failed to update membership");
//         }
//       } else {
//         result = await createMembership(submitData);
//         if (result.success) {
//           toast.success("Membership created successfully");
//           setIsCreateDialogOpen(false);
//           refreshMemberships();
//         } else {
//           toast.error(result.error || "Failed to create membership");
//         }
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleClose = () => {
//     if (isEditMode) {
//       setIsEditDialogOpen(false);
//     } else {
//       setIsCreateDialogOpen(false);
//     }
//   };

//   const addAllocation = () => {
//     appendAllocation({
//       categoryId: "none",
//       categoryName: "",
//       quantity: 1,
//       allowedProducts: [],
//     });
//   };

//   const addBenefit = () => {
//     appendBenefit({
//       title: "",
//       description: "",
//       type: "other",
//       value: "",
//     });
//   };

//   const addFeature = (feature: string) => {
//     if (feature.trim()) {
//       appendFeature(feature.trim());
//     }
//   };

//   const selectedTier = form.watch("tier");
//   const selectedTierOption = tierOptions.find(
//     (option) => option.value === selectedTier
//   );
//   const TierIcon = selectedTierOption?.icon || Package;

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
//         <DialogHeader className="px-4 sm:px-6">
//           <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
//             <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white">
//               <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
//             </div>
//             <span className="truncate">
//               {isEditMode ? "Edit Membership" : "Create New Membership"}
//             </span>
//           </DialogTitle>
//         </DialogHeader>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-4 sm:space-y-6"
//           >
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="w-full"
//             >
//               <TabsList className="grid w-full grid-cols-5 mx-4 sm:mx-6">
//                 <TabsTrigger value="basic" className="text-xs">
//                   Basic
//                 </TabsTrigger>
//                 <TabsTrigger value="pricing" className="text-xs">
//                   Pricing
//                 </TabsTrigger>
//                 <TabsTrigger value="products" className="text-xs">
//                   Products
//                 </TabsTrigger>
//                 <TabsTrigger value="benefits" className="text-xs">
//                   Benefits
//                 </TabsTrigger>
//                 <TabsTrigger value="settings" className="text-xs">
//                   Settings
//                 </TabsTrigger>
//               </TabsList>

//               <ScrollArea className="h-[400px] sm:h-[500px] px-4 sm:px-6">
//                 <div className="space-y-4 sm:space-y-6 py-4">
//                   {/* Basic Information Tab */}
//                   <TabsContent value="basic" className="space-y-6 mt-0">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="space-y-6"
//                     >
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg flex items-center gap-2">
//                             <Settings className="h-5 w-5" />
//                             Basic Information
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                             <FormField
//                               control={form.control}
//                               name="name"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Membership Name</FormLabel>
//                                   <FormControl>
//                                     <Input
//                                       placeholder="e.g., VIP Premium Plan"
//                                       {...field}
//                                     />
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />

//                             <FormField
//                               control={form.control}
//                               name="tier"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Tier</FormLabel>
//                                   <Select
//                                     onValueChange={field.onChange}
//                                     value={field.value}
//                                   >
//                                     <FormControl>
//                                       <SelectTrigger>
//                                         <SelectValue placeholder="Select tier" />
//                                       </SelectTrigger>
//                                     </FormControl>
//                                     <SelectContent>
//                                       {tierOptions.map((tier) => (
//                                         <SelectItem
//                                           key={tier.value}
//                                           value={tier.value}
//                                         >
//                                           <div className="flex items-center gap-2">
//                                             <tier.icon
//                                               className="h-4 w-4"
//                                               style={{ color: tier.color }}
//                                             />
//                                             {tier.label}
//                                           </div>
//                                         </SelectItem>
//                                       ))}
//                                     </SelectContent>
//                                   </Select>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>

//                           <FormField
//                             control={form.control}
//                             name="description"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Description</FormLabel>
//                                 <FormControl>
//                                   <Textarea
//                                     placeholder="Describe what this membership includes..."
//                                     className="resize-none"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                             <FormField
//                               control={form.control}
//                               name="isActive"
//                               render={({ field }) => (
//                                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
//                                   <div className="space-y-0.5">
//                                     <FormLabel className="text-sm sm:text-base">
//                                       Active
//                                     </FormLabel>
//                                     <FormDescription className="text-xs sm:text-sm">
//                                       Allow users to subscribe
//                                     </FormDescription>
//                                   </div>
//                                   <FormControl>
//                                     <Switch
//                                       checked={field.value}
//                                       onCheckedChange={field.onChange}
//                                     />
//                                   </FormControl>
//                                 </FormItem>
//                               )}
//                             />

//                             <FormField
//                               control={form.control}
//                               name="isPopular"
//                               render={({ field }) => (
//                                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
//                                   <div className="space-y-0.5">
//                                     <FormLabel className="text-sm sm:text-base flex items-center gap-1">
//                                       <Sparkles className="h-4 w-4" />
//                                       Popular
//                                     </FormLabel>
//                                     <FormDescription className="text-xs sm:text-sm">
//                                       Highlight this plan
//                                     </FormDescription>
//                                   </div>
//                                   <FormControl>
//                                     <Switch
//                                       checked={field.value}
//                                       onCheckedChange={field.onChange}
//                                     />
//                                   </FormControl>
//                                 </FormItem>
//                               )}
//                             />

//                             <FormField
//                               control={form.control}
//                               name="sortOrder"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Sort Order</FormLabel>
//                                   <FormControl>
//                                     <Input
//                                       type="number"
//                                       placeholder="0"
//                                       {...field}
//                                       onChange={(e) =>
//                                         field.onChange(
//                                           parseInt(e.target.value) || 0
//                                         )
//                                       }
//                                     />
//                                   </FormControl>
//                                   <FormDescription className="text-xs sm:text-sm">
//                                     Lower numbers appear first
//                                   </FormDescription>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </TabsContent>

//                   {/* Pricing Tab */}
//                   <TabsContent value="pricing" className="space-y-6 mt-0">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="space-y-6"
//                     >
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg flex items-center gap-2">
//                             <DollarSign className="h-5 w-5" />
//                             Pricing Configuration
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-6">
//                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                             <FormField
//                               control={form.control}
//                               name="price"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Price (USD)</FormLabel>
//                                   <FormControl>
//                                     <div className="relative">
//                                       <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                                       <Input
//                                         type="number"
//                                         step="0.01"
//                                         min="0"
//                                         placeholder="0.00"
//                                         className="pl-10"
//                                         {...field}
//                                         onChange={(e) =>
//                                           field.onChange(
//                                             parseFloat(e.target.value) || 0
//                                           )
//                                         }
//                                       />
//                                     </div>
//                                   </FormControl>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />

//                             <FormField
//                               control={form.control}
//                               name="billingFrequency"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Billing Frequency</FormLabel>
//                                   <Select
//                                     onValueChange={field.onChange}
//                                     value={field.value}
//                                   >
//                                     <FormControl>
//                                       <SelectTrigger>
//                                         <SelectValue placeholder="Select frequency" />
//                                       </SelectTrigger>
//                                     </FormControl>
//                                     <SelectContent>
//                                       <SelectItem value="monthly">
//                                         Monthly
//                                       </SelectItem>
//                                       <SelectItem value="quarterly">
//                                         Quarterly
//                                       </SelectItem>
//                                       <SelectItem value="yearly">
//                                         Yearly
//                                       </SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>

//                           {/* Price Preview */}
//                           <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
//                             <CardContent className="p-6">
//                               <div className="text-center space-y-2">
//                                 <div className="flex items-center justify-center gap-2">
//                                   <TierIcon
//                                     className="h-6 w-6"
//                                     style={{ color: selectedTierOption?.color }}
//                                   />
//                                   <h3 className="text-xl font-semibold">
//                                     {form.watch("name") || "Membership Name"}
//                                   </h3>
//                                 </div>
//                                 <div className="text-3xl font-bold">
//                                   ${form.watch("price") || 0}
//                                   <span className="text-lg text-muted-foreground">
//                                     /{form.watch("billingFrequency")}
//                                   </span>
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </TabsContent>

//                   {/* Product Allocations Tab */}
//                   <TabsContent value="products" className="space-y-6 mt-0">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="space-y-6"
//                     >
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg flex items-center gap-2">
//                             <Package className="h-5 w-5" />
//                             Product Allocations
//                           </CardTitle>
//                           <p className="text-xs sm:text-sm text-muted-foreground">
//                             Define how many products from each category members
//                             can select
//                           </p>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                           <AnimatePresence>
//                             {allocationFields.map((field, index) => (
//                               <motion.div
//                                 key={field.id}
//                                 initial={{ opacity: 0, height: 0 }}
//                                 animate={{ opacity: 1, height: "auto" }}
//                                 exit={{ opacity: 0, height: 0 }}
//                                 className="p-4 border rounded-lg space-y-4"
//                               >
//                                 <div className="flex items-center justify-between">
//                                   <h4 className="font-medium">
//                                     Allocation {index + 1}
//                                   </h4>
//                                   <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => removeAllocation(index)}
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </div>

//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                                   <FormField
//                                     control={form.control}
//                                     name={`productAllocations.${index}.categoryId`}
//                                     render={({ field }) => (
//                                       <FormItem>
//                                         <FormLabel>Category</FormLabel>
//                                         <Select
//                                           onValueChange={(value) => {
//                                             if (value !== "none") {
//                                               field.onChange(value);
//                                               const category = categories.find(
//                                                 (c: Category) => c._id === value
//                                               );
//                                               if (category) {
//                                                 form.setValue(
//                                                   `productAllocations.${index}.categoryName`,
//                                                   category.name
//                                                 );
//                                               }
//                                             } else {
//                                               field.onChange("");
//                                               form.setValue(
//                                                 `productAllocations.${index}.categoryName`,
//                                                 ""
//                                               );
//                                             }
//                                           }}
//                                           value={field.value || "none"}
//                                         >
//                                           <FormControl>
//                                             <SelectTrigger>
//                                               <SelectValue placeholder="Select category" />
//                                             </SelectTrigger>
//                                           </FormControl>
//                                           <SelectContent>
//                                             <SelectItem value="none">
//                                               Select a category
//                                             </SelectItem>
//                                             {categories.map(
//                                               (category: Category) => (
//                                                 <SelectItem
//                                                   key={category._id}
//                                                   value={category._id}
//                                                 >
//                                                   {category.name}
//                                                 </SelectItem>
//                                               )
//                                             )}
//                                           </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                       </FormItem>
//                                     )}
//                                   />

//                                   <FormField
//                                     control={form.control}
//                                     name={`productAllocations.${index}.quantity`}
//                                     render={({ field }) => (
//                                       <FormItem>
//                                         <FormLabel>Quantity</FormLabel>
//                                         <FormControl>
//                                           <Input
//                                             type="number"
//                                             min="0"
//                                             placeholder="1"
//                                             {...field}
//                                             onChange={(e) =>
//                                               field.onChange(
//                                                 parseInt(e.target.value) || 0
//                                               )
//                                             }
//                                           />
//                                         </FormControl>
//                                         <FormMessage />
//                                       </FormItem>
//                                     )}
//                                   />
//                                 </div>
//                               </motion.div>
//                             ))}
//                           </AnimatePresence>

//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={addAllocation}
//                             className="w-full"
//                           >
//                             <Plus className="mr-2 h-4 w-4" />
//                             Add Product Allocation
//                           </Button>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </TabsContent>

//                   {/* Benefits Tab */}
//                   <TabsContent value="benefits" className="space-y-6 mt-0">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="space-y-6"
//                     >
//                       {/* Custom Benefits */}
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg flex items-center gap-2">
//                             <Gift className="h-5 w-5" />
//                             Custom Benefits
//                           </CardTitle>
//                           <p className="text-xs sm:text-sm text-muted-foreground">
//                             Add special perks like webinars, exclusive content,
//                             or services
//                           </p>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                           <AnimatePresence>
//                             {benefitFields.map((field, index) => (
//                               <motion.div
//                                 key={field.id}
//                                 initial={{ opacity: 0, height: 0 }}
//                                 animate={{ opacity: 1, height: "auto" }}
//                                 exit={{ opacity: 0, height: 0 }}
//                                 className="p-4 border rounded-lg space-y-4"
//                               >
//                                 <div className="flex items-center justify-between">
//                                   <h4 className="font-medium">
//                                     Benefit {index + 1}
//                                   </h4>
//                                   <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => removeBenefit(index)}
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </div>

//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                                   <FormField
//                                     control={form.control}
//                                     name={`customBenefits.${index}.type`}
//                                     render={({ field }) => (
//                                       <FormItem>
//                                         <FormLabel>Type</FormLabel>
//                                         <Select
//                                           onValueChange={(value) => {
//                                             if (value !== "none") {
//                                               field.onChange(value);
//                                             } else {
//                                               field.onChange("other");
//                                             }
//                                           }}
//                                           value={field.value || "other"}
//                                         >
//                                           <FormControl>
//                                             <SelectTrigger>
//                                               <SelectValue placeholder="Select type" />
//                                             </SelectTrigger>
//                                           </FormControl>
//                                           <SelectContent>
//                                             {benefitTypes.map((type) => (
//                                               <SelectItem
//                                                 key={type.value}
//                                                 value={type.value}
//                                               >
//                                                 <div className="flex items-center gap-2">
//                                                   <type.icon className="h-4 w-4" />
//                                                   {type.label}
//                                                 </div>
//                                               </SelectItem>
//                                             ))}
//                                           </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                       </FormItem>
//                                     )}
//                                   />

//                                   <FormField
//                                     control={form.control}
//                                     name={`customBenefits.${index}.title`}
//                                     render={({ field }) => (
//                                       <FormItem>
//                                         <FormLabel>Title</FormLabel>
//                                         <FormControl>
//                                           <Input
//                                             placeholder="e.g., Monthly Health Webinar"
//                                             {...field}
//                                           />
//                                         </FormControl>
//                                         <FormMessage />
//                                       </FormItem>
//                                     )}
//                                   />
//                                 </div>

//                                 <FormField
//                                   control={form.control}
//                                   name={`customBenefits.${index}.description`}
//                                   render={({ field }) => (
//                                     <FormItem>
//                                       <FormLabel>Description</FormLabel>
//                                       <FormControl>
//                                         <Textarea
//                                           placeholder="Describe this benefit..."
//                                           className="resize-none"
//                                           {...field}
//                                         />
//                                       </FormControl>
//                                       <FormMessage />
//                                     </FormItem>
//                                   )}
//                                 />

//                                 <FormField
//                                   control={form.control}
//                                   name={`customBenefits.${index}.value`}
//                                   render={({ field }) => (
//                                     <FormItem>
//                                       <FormLabel>Value (Optional)</FormLabel>
//                                       <FormControl>
//                                         <Input
//                                           placeholder="e.g., 20% off, Free shipping"
//                                           {...field}
//                                         />
//                                       </FormControl>
//                                       <FormDescription className="text-xs sm:text-sm">
//                                         Additional value information like
//                                         discount amounts
//                                       </FormDescription>
//                                       <FormMessage />
//                                     </FormItem>
//                                   )}
//                                 />
//                               </motion.div>
//                             ))}
//                           </AnimatePresence>

//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={addBenefit}
//                             className="w-full"
//                           >
//                             <Plus className="mr-2 h-4 w-4" />
//                             Add Custom Benefit
//                           </Button>
//                         </CardContent>
//                       </Card>

//                       {/* Features */}
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg">Features</CardTitle>
//                           <p className="text-xs sm:text-sm text-muted-foreground">
//                             List the key features of this membership
//                           </p>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                           <div className="space-y-2">
//                             {featureFields.map((field, index) => (
//                               <div
//                                 key={field.id}
//                                 className="flex items-center gap-2"
//                               >
//                                 <Input
//                                   value={form.watch(`features.${index}`) || ""}
//                                   onChange={(e) =>
//                                     form.setValue(
//                                       `features.${index}`,
//                                       e.target.value
//                                     )
//                                   }
//                                   placeholder="Enter feature"
//                                 />
//                                 <Button
//                                   type="button"
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => removeFeature(index)}
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             ))}
//                           </div>

//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={() => addFeature("")}
//                             className="w-full"
//                           >
//                             <Plus className="mr-2 h-4 w-4" />
//                             Add Feature
//                           </Button>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </TabsContent>

//                   {/* Settings Tab */}
//                   <TabsContent value="settings" className="space-y-6 mt-0">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="space-y-6"
//                     >
//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg flex items-center gap-2">
//                             <Settings className="h-5 w-5" />
//                             Configuration
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-6">
//                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                             <FormField
//                               control={form.control}
//                               name="deliveryFrequency"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>Delivery Frequency</FormLabel>
//                                   <Select
//                                     onValueChange={field.onChange}
//                                     value={field.value}
//                                   >
//                                     <FormControl>
//                                       <SelectTrigger>
//                                         <SelectValue placeholder="Select frequency" />
//                                       </SelectTrigger>
//                                     </FormControl>
//                                     <SelectContent>
//                                       <SelectItem value="weekly">
//                                         Weekly
//                                       </SelectItem>
//                                       <SelectItem value="bi-weekly">
//                                         Bi-weekly
//                                       </SelectItem>
//                                       <SelectItem value="monthly">
//                                         Monthly
//                                       </SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />

//                             <FormField
//                               control={form.control}
//                               name="maxProductsPerMonth"
//                               render={({ field }) => (
//                                 <FormItem>
//                                   <FormLabel>
//                                     Max Products/Month (Optional)
//                                   </FormLabel>
//                                   <FormControl>
//                                     <Input
//                                       type="number"
//                                       min="0"
//                                       placeholder="No limit"
//                                       {...field}
//                                       onChange={(e) =>
//                                         field.onChange(
//                                           parseInt(e.target.value) || undefined
//                                         )
//                                       }
//                                     />
//                                   </FormControl>
//                                   <FormDescription className="text-xs sm:text-sm">
//                                     Leave empty for no limit
//                                   </FormDescription>
//                                   <FormMessage />
//                                 </FormItem>
//                               )}
//                             />
//                           </div>

//                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                             <FormField
//                               control={form.control}
//                               name="freeDelivery"
//                               render={({ field }) => (
//                                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
//                                   <div className="space-y-0.5">
//                                     <FormLabel className="text-sm sm:text-base flex items-center gap-2">
//                                       <Truck className="h-4 w-4" />
//                                       Free Delivery
//                                     </FormLabel>
//                                     <FormDescription className="text-xs sm:text-sm">
//                                       Include free delivery
//                                     </FormDescription>
//                                   </div>
//                                   <FormControl>
//                                     <Switch
//                                       checked={field.value}
//                                       onCheckedChange={field.onChange}
//                                     />
//                                   </FormControl>
//                                 </FormItem>
//                               )}
//                             />

//                             <FormField
//                               control={form.control}
//                               name="prioritySupport"
//                               render={({ field }) => (
//                                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
//                                   <div className="space-y-0.5">
//                                     <FormLabel className="text-sm sm:text-base flex items-center gap-2">
//                                       <Headphones className="h-4 w-4" />
//                                       Priority Support
//                                     </FormLabel>
//                                     <FormDescription className="text-xs sm:text-sm">
//                                       Provide priority customer support
//                                     </FormDescription>
//                                   </div>
//                                   <FormControl>
//                                     <Switch
//                                       checked={field.value}
//                                       onCheckedChange={field.onChange}
//                                     />
//                                   </FormControl>
//                                 </FormItem>
//                               )}
//                             />
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card>
//                         <CardHeader>
//                           <CardTitle className="text-lg flex items-center gap-2">
//                             <Palette className="h-5 w-5" />
//                             Display Settings
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                           <FormField
//                             control={form.control}
//                             name="color"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Theme Color (Optional)</FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   value={field.value || "default"}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger>
//                                       <SelectValue placeholder="Select color" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     <SelectItem value="default">
//                                       <div className="flex items-center gap-2">
//                                         <div className="w-4 h-4 rounded-full border border-gray-300 bg-transparent" />
//                                         Default
//                                       </div>
//                                     </SelectItem>
//                                     {colorOptions.map((color) => (
//                                       <SelectItem
//                                         key={color.value}
//                                         value={color.value}
//                                       >
//                                         <div className="flex items-center gap-2">
//                                           <div
//                                             className="w-4 h-4 rounded-full border"
//                                             style={{
//                                               backgroundColor: color.value,
//                                             }}
//                                           />
//                                           {color.label}
//                                         </div>
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             control={form.control}
//                             name="icon"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Icon (Optional)</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     placeholder="e.g., crown, star, diamond"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormDescription className="text-xs sm:text-sm">
//                                   Icon name for display purposes
//                                 </FormDescription>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </TabsContent>
//                 </div>
//               </ScrollArea>
//             </Tabs>

//             {/* Footer Actions */}
//             <div className="flex items-center justify-between pt-6 border-t">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleClose}
//                 disabled={isLoading}
//               >
//                 <X className="mr-2 h-4 w-4" />
//                 Cancel
//               </Button>

//               <div className="flex items-center gap-3">
//                 <Badge variant="outline" className="text-xs">
//                   Tab{" "}
//                   {[
//                     "basic",
//                     "pricing",
//                     "products",
//                     "benefits",
//                     "settings",
//                   ].indexOf(activeTab) + 1}{" "}
//                   of 5
//                 </Badge>

//                 <Button type="submit" disabled={isLoading}>
//                   {isLoading ? (
//                     <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
//                   ) : (
//                     <Save className="mr-2 h-4 w-4" />
//                   )}
//                   {isLoading
//                     ? isEditMode
//                       ? "Updating..."
//                       : "Creating..."
//                     : isEditMode
//                       ? "Update Membership"
//                       : "Create Membership"}
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }
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

// --- START: Corrected Import Paths ---
// Assuming MembershipDialog.tsx is located at: ./app/(admin)/admin/memberships/components/MembershipDialog.tsx
//
// 1. Corrected path for MembershipsProvider:
//    If MembershipsProvider is a sibling component (in the same 'components' directory):
//    import { useMemberships } from "./MembershipsProvider"; // This was the previous attempt
//    However, the error suggests it's not. A common pattern for providers is one level up.
//    Let's assume MembershipsProvider.tsx is located at:
//    ./app/(admin)/admin/memberships/MembershipsProvider.tsx

// 2. Corrected path for membershipServerActions:
//    The error indicates '@/lib/actions/membershipServerActions' was remapped to '/app/lib/actions/membershipServerActions'
//    and then failed. This often implies 'lib' is at the project root.
//    To reach it from ./app/(admin)/admin/memberships/components/MembershipDialog.tsx:
//    - From 'components' to 'memberships': ..
//    - From 'memberships' to 'admin': ../..
//    - From 'admin' to '(admin)': ../../..
//    - From '(admin)' to 'app': ../../../..
//    - From 'app' to project root (where 'lib' is): ../../../../..  <-- This would be the path if 'lib' is truly outside 'app'
//
//    However, the error's remapping to '/app/lib...' suggests 'app' is the base.
//    Let's try a relative path that assumes 'lib' is at the root of the project, one level up from 'app'.
//    If your project structure is:
//    - project-root/
//      - app/
//        - (admin)/
//          - admin/
//            - memberships/
//              - components/
//                - MembershipDialog.tsx (current file)
//      - lib/
//        - actions/
//          - membershipServerActions.ts
//
//    Then the path from MembershipDialog.tsx to lib/actions/... would be:
//    ../../../../lib/actions/membershipServerActions
//
//    Given the persistent error, there might be a subtle difference in your exact folder structure
//    or how aliases are configured/resolved in your specific Next.js setup.
//    I'm going with the most common successful relative path for this structure.

// --- END: Corrected Import Paths ---

// =========================================================
// 1. Zod Schema: Define the shape of data the FORM handles
//    This should NOT include Mongoose ObjectIDs or backend-only fields.
// =========================================================
const membershipSchema = z.object({
  name: z.string().min(1, "Membership name is required"),
  description: z.string().optional(),
  tier: z.enum(["basic", "premium", "vip", "elite"]),

  // Pricing
  price: z.number().min(0, "Price must be positive"),
  billingFrequency: z.enum(["monthly", "quarterly", "yearly"]),
  currency: z.string().min(1, "Currency is required"), // Added based on IMembership

  // Product Allocations - categoryId and allowedProducts will be strings from the form
  productAllocations: z
    .array(
      z.object({
        categoryId: z.string().min(1, "Category is required"), // Form will handle categoryId as string
        categoryName: z.string().min(1, "Category name is required"),
        quantity: z.number().int().min(0, "Quantity must be positive"),
        allowedProducts: z.array(z.string()).optional(), // Form will handle product IDs as strings
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
    .default([]), // Ensure it defaults to an empty array

  // Features
  features: z.array(z.string()).default([]), // Ensure it defaults to an empty array

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

// =========================================================
// 2. MembershipForm Type: Inferred from the Zod schema
//    This is the type React Hook Form will use internally.
// =========================================================
type MembershipForm = z.infer<typeof membershipSchema>;

// =========================================================
// Helper Interfaces & Constants (as you had them)
// =========================================================
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

// Category type based on your context's categories
interface Category {
  _id: string; // Assuming category IDs are strings in the frontend categories list
  name: string;
}

// =========================================================
// IMembership: Your Mongoose Model Interface (for reference)
// =========================================================
// This interface defines the shape of data in your database.
// When using selectedMembership, you'll need to transform it
// to match MembershipForm before resetting the form.
/*
interface IMembership extends Document {
  _id: string;
  name: string;
  description?: string;
  tier: "basic" | "premium" | "vip" | "elite";
  price: number;
  billingFrequency: "monthly" | "quarterly" | "yearly";
  currency: string;
  productAllocations: {
    categoryId: mongoose.Types.ObjectId;
    categoryName: string;
    quantity: number;
    allowedProducts?: mongoose.Types.ObjectId[];
  }[];
  customBenefits: {
    title: string;
    description: string;
    type: "webinar" | "content" | "discount" | "service" | "other";
    value?: string;
  }[];
  features: string[];
  maxProductsPerMonth?: number;
  deliveryFrequency: "weekly" | "bi-weekly" | "monthly";
  freeDelivery: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  color?: string;
  icon?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  totalSubscribers: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}
*/

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
    selectedMembership, // This is IMembership | null
    categories,
    refreshMemberships,
  } = useMemberships();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const isOpen = isCreateDialogOpen || isEditDialogOpen;
  const isEditMode = isEditDialogOpen && selectedMembership;

  // =========================================================
  // 3. useForm Initialization: Ensure default values align with MembershipForm
  // =========================================================
  const form = useForm<MembershipForm>({
    resolver: zodResolver(membershipSchema) as any, // Type assertion to avoid type mismatch error
    defaultValues: {
      name: "",
      description: "",
      tier: "basic",
      price: 0,
      billingFrequency: "monthly",
      currency: "USD", // Explicitly set default for currency
      productAllocations: [],
      customBenefits: [],
      features: [],
      deliveryFrequency: "monthly",
      freeDelivery: false,
      prioritySupport: false,
      isActive: true,
      isPopular: false,
      sortOrder: 0,
      color: undefined, // Optional fields should default to undefined or a specific value if required
      icon: undefined, // Optional fields should default to undefined
      maxProductsPerMonth: undefined, // Optional fields should default to undefined
    },
  });

  const {
    fields: allocationFields,
    append: appendAllocation,
    remove: removeAllocation,
  } = useFieldArray({
    control: form.control, // 'control' type will now match MembershipForm correctly
    name: "productAllocations",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control: form.control, // 'control' type will now match MembershipForm correctly
    name: "customBenefits",
  });

  // Remove useFieldArray for features, as features is a simple string array

  // =========================================================
  // 4. useEffect for Reset: Transform IMembership to MembershipForm
  // =========================================================
  useEffect(() => {
    if (isOpen) {
      setActiveTab("basic");

      if (isEditMode && selectedMembership) {
        // Explicitly map selectedMembership (IMembership) to MembershipForm
        const formValues: MembershipForm = {
          name: selectedMembership.name || "",
          description: selectedMembership.description || "",
          tier: selectedMembership.tier || "basic",
          price: selectedMembership.price || 0,
          billingFrequency: selectedMembership.billingFrequency || "monthly",
          currency: selectedMembership.currency || "USD",
          productAllocations:
            selectedMembership.productAllocations?.map(
              (pa: {
                categoryId: string | { toString: () => string };
                categoryName: string;
                quantity: number;
                allowedProducts?: (string | { toString: () => string })[];
              }): {
                categoryId: string;
                categoryName: string;
                quantity: number;
                allowedProducts: string[];
              } => ({
                // Ensure categoryId is correctly converted to string if it's an ObjectId
                categoryId:
                  typeof pa.categoryId === "object" &&
                  pa.categoryId !== null &&
                  "toString" in pa.categoryId
                    ? pa.categoryId.toString()
                    : String(pa.categoryId || ""), // Fallback for safety
                categoryName: pa.categoryName,
                quantity: pa.quantity,
                allowedProducts:
                  pa.allowedProducts?.map(
                    (p: string | { toString: () => string }): string =>
                      typeof p === "object" && p !== null && "toString" in p
                        ? p.toString()
                        : String(p || "")
                  ) || [], // Convert ObjectIds to strings, ensure array
              })
            ) || [], // Ensure array if productAllocations itself is optional
          customBenefits: Array.isArray(selectedMembership.customBenefits)
            ? selectedMembership.customBenefits
            : [], // Always array
          features: Array.isArray(selectedMembership.features)
            ? selectedMembership.features
            : [], // Always array
          deliveryFrequency: selectedMembership.deliveryFrequency || "monthly",
          freeDelivery: selectedMembership.freeDelivery || false,
          prioritySupport: selectedMembership.prioritySupport || false,
          isActive:
            selectedMembership.isActive !== undefined
              ? selectedMembership.isActive
              : true, // Handle boolean explicitly
          isPopular: selectedMembership.isPopular || false, // Handle boolean explicitly
          sortOrder: selectedMembership.sortOrder || 0, // Handle number explicitly
          color: selectedMembership.color || undefined, // Ensure optional string is undefined if not present
          icon: selectedMembership.icon || undefined, // Ensure optional string is undefined if not present
          maxProductsPerMonth:
            selectedMembership.maxProductsPerMonth || undefined, // Ensure optional number is undefined
        };
        form.reset(formValues);
      } else {
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
    }
  }, [isOpen, isEditMode, selectedMembership, form]); // Dependencies correct

  // =========================================================
  // onSubmit: Transform form data back to IMembership shape (for server)
  // =========================================================
  const onSubmit = async (data: MembershipForm) => {
    setIsLoading(true);
    try {
      // Transform data before sending to server
      // Note: Server-side (actions) will likely handle converting string IDs back to ObjectIds
      // and adding createdBy/updatedBy, createdAt/updatedAt.
      const submitData = {
        ...data,
        color: data.color === "default" ? undefined : data.color, // Your existing logic
        // If your backend expects currency, it's already in data.currency
        // You might need to transform productAllocations.categoryId back to ObjectId on server
        // You might need to transform allowedProducts back to ObjectId on server
      };

      let result;

      if (isEditMode && selectedMembership) {
        // Ensure allowedProducts is always an array (never undefined)
        const fixedSubmitData = {
          ...submitData,
          productAllocations: submitData.productAllocations.map((alloc) => ({
            ...alloc,
            allowedProducts: alloc.allowedProducts ?? [],
          })),
        };
        result = await updateMembership(
          selectedMembership._id,
          fixedSubmitData
        ); // Use original _id
        if (result.success) {
          toast.success("Membership updated successfully");
          setIsEditDialogOpen(false);
          refreshMemberships();
        } else {
          toast.error(result.error || "Failed to update membership");
        }
      } else {
        // Ensure allowedProducts is always a defined array for each allocation
        const fixedSubmitData = {
          ...submitData,
          productAllocations: submitData.productAllocations.map((alloc) => ({
            ...alloc,
            allowedProducts: alloc.allowedProducts ?? [],
          })),
        };
        result = await createMembership(fixedSubmitData);
        if (result.success) {
          toast.success("Membership created successfully");
          setIsCreateDialogOpen(false);
          refreshMemberships();
        } else {
          toast.error(result.error || "Failed to create membership");
        }
      }
    } catch (error) {
      console.error("Submission error:", error); // Log the actual error
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
      categoryId: "none", // Default string for new allocation
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

  // For adding a feature from an input field
  const handleAddFeatureInput = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && event.currentTarget.value.trim()) {
      addFeature(event.currentTarget.value.trim());
      event.currentTarget.value = ""; // Clear input after adding
    }
  };

  // Original addFeature function remains (if called from elsewhere)
  const addFeature = (feature: string) => {
    if (feature.trim()) {
      form.setValue(
        "features",
        [...form.getValues("features"), feature.trim()],
        { shouldValidate: true, shouldDirty: true }
      );
    }
  };

  const selectedTier = form.watch("tier");
  const selectedTierOption = tierOptions.find(
    (option) => option.value === selectedTier
  );
  const TierIcon = selectedTierOption?.icon || Package; // Fallback icon

  function removeFeature(index: number): void {
    const features = form.getValues("features");
    const updated = [...features.slice(0, index), ...features.slice(index + 1)];
    form.setValue("features", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

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
                          {/* Color and Icon fields can be added here or in settings tab */}
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
                                    value={field.value || ""} // Ensure controlled component
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
                                              field.onChange(""); // Clear categoryId
                                              form.setValue(
                                                `productAllocations.${index}.categoryName`,
                                                ""
                                              );
                                            }
                                          }}
                                          value={field.value || "none"} // Ensure "none" for initial selection
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="none" disabled>
                                              Select a category
                                            </SelectItem>
                                            {categories.map((category) => (
                                              <SelectItem
                                                key={category._id}
                                                value={category._id}
                                              >
                                                {category.name}
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
                                {/* Allowed Products (optional) */}
                                <FormField
                                  control={form.control}
                                  name={`productAllocations.${index}.allowedProducts`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Allowed Specific Products (Optional)
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter product IDs, separated by commas (e.g., prod123, prod456)"
                                          value={field.value?.join(", ") || ""}
                                          onChange={(e) => {
                                            // Split string by commas, trim each, filter out empty strings
                                            const productIds = e.target.value
                                              .split(",")
                                              .map((id) => id.trim())
                                              .filter((id) => id !== "");
                                            field.onChange(productIds);
                                          }}
                                          className="resize-none"
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        List specific product IDs if the
                                        allocation is limited to certain
                                        products.
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
                            onClick={addAllocation}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                            Allocation
                          </Button>
                        </CardContent>
                      </Card>
                      {/* Max Products Per Month */}
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
                                    value={field.value ?? ""} // Handle undefined gracefully
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
                  </TabsContent>

                  {/* Custom Benefits Tab */}
                  <TabsContent value="benefits" className="space-y-6 mt-0">
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
                      {/* Features List */}
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
                                        key={feature + index} // Simple key for display, consider unique IDs if features can duplicate
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
                  </TabsContent>
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
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
