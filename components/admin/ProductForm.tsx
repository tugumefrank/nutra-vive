"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  Image,
  Tag,
  Layers,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Leaf,
} from "lucide-react";

// Import real server actions

// Import real UploadThing hook
import { useUploadThing } from "@/lib/uploadthing";

// Import real ImageUploader component
import { ImageUploader } from "@/components/ui/FileUploader";

import { generateSKU } from "@/lib/productUtils";
import {
  createProduct,
  updateProduct,
} from "@/lib/actions/productServerActions";

// Types
interface IProduct {
  _id?: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  category?: { _id: string; name: string };
  inventory: number;
  description?: string;
  shortDescription?: string;
  images: string[];
  tags?: string[];
  features?: string[];
  ingredients?: string[];
  nutritionFacts?: {
    servingSize?: string;
    calories?: number;
    totalFat?: string;
    sodium?: string;
    totalCarbs?: string;
    sugars?: string;
    protein?: string;
    vitaminC?: string;
  };
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: "in" | "cm";
  };
  isActive: boolean;
  isFeatured: boolean;
  trackQuantity: boolean;
  allowBackorder: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product?: IProduct | null;
  categories: ICategory[];
  onClose: () => void;
  onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({
    name: product?.name || "",
    slug: product?.slug || "",
    price: product?.price || "",
    compareAtPrice: product?.compareAtPrice || "",
    costPrice: product?.costPrice || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category?._id || "",
    inventory: product?.inventory || 0,
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    images: product?.images || [],
    tags: product?.tags?.join(", ") || "",
    features: product?.features?.join(", ") || "",
    ingredients: product?.ingredients?.join(", ") || "",
    nutritionFacts: {
      servingSize: product?.nutritionFacts?.servingSize || "",
      calories: product?.nutritionFacts?.calories || "",
      totalFat: product?.nutritionFacts?.totalFat || "",
      sodium: product?.nutritionFacts?.sodium || "",
      totalCarbs: product?.nutritionFacts?.totalCarbs || "",
      sugars: product?.nutritionFacts?.sugars || "",
      protein: product?.nutritionFacts?.protein || "",
      vitaminC: product?.nutritionFacts?.vitaminC || "",
    },
    weight: product?.weight || "",
    dimensions: {
      length: product?.dimensions?.length || "",
      width: product?.dimensions?.width || "",
      height: product?.dimensions?.height || "",
      unit: product?.dimensions?.unit || "in",
    },
    isActive: product?.isActive !== false,
    isFeatured: product?.isFeatured || false,
    trackQuantity: product?.trackQuantity !== false,
    allowBackorder: product?.allowBackorder || false,
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
  });

  const [errors, setErrors] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>(
    {}
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // UploadThing hook for multiple images
  const { startUpload: uploadImages } = useUploadThing("imageUploader", {
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res: any) => {
      setIsUploading(false);
      setUploadProgress(100);
      if (res && res.length > 0) {
        const uploadedUrls = res.map((file: any) => file.url);
        setFormData((prev: any) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        setImageFiles([]);
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Upload failed:", error);
    },
  });

  // Auto-upload when files are selected
  useEffect(() => {
    if (imageFiles.length > 0 && !isUploading) {
      uploadImages(imageFiles);
    }
  }, [imageFiles, isUploading, uploadImages]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev: any) => ({ ...prev, slug }));
    }
  }, [formData.name, product]);

  // Auto-generate meta title from name
  useEffect(() => {
    if (formData.name && !formData.metaTitle) {
      setFormData((prev: any) => ({
        ...prev,
        metaTitle: `${formData.name} - Nutra-Vive Organic`,
      }));
    }
  }, [formData.name, formData.metaTitle]);

  useEffect(() => {
    if (formData.name && formData.category && !product) {
      const categoryName =
        categories.find((cat) => cat._id === formData.category)?.name || "";
      if (categoryName) {
        const generatedSKU = generateSKU(formData.name, categoryName);
        setFormData((prev: any) => ({ ...prev, sku: generatedSKU }));
      }
    }
  }, [formData.name, formData.category, categories, product]);

  const steps = [
    { id: 1, title: "Basic Info", icon: Package },
    { id: 2, title: "Pricing", icon: DollarSign },
    { id: 3, title: "Images", icon: Image },
    { id: 4, title: "Details", icon: Tag },
    { id: 5, title: "SEO & Settings", icon: Layers },
  ];

  const validateStep = (step: number) => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (!formData.slug.trim()) newErrors.slug = "Product slug is required";
        if (!formData.shortDescription.trim())
          newErrors.shortDescription = "Short description is required";
        break;
      case 2:
        if (!formData.price || formData.price <= 0)
          newErrors.price = "Valid price is required";
        if (
          formData.compareAtPrice &&
          formData.compareAtPrice <= formData.price
        ) {
          newErrors.compareAtPrice =
            "Compare price must be higher than regular price";
        }
        if (formData.trackQuantity && formData.inventory < 0) {
          newErrors.inventory = "Inventory cannot be negative";
        }
        break;
      case 3:
        if (formData.images.length === 0)
          newErrors.images = "At least one product image is required";
        break;
      case 4:
        if (!formData.ingredients.trim())
          newErrors.ingredients = "Ingredients list is required";
        break;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation((prev) => ({ ...prev, [step]: isValid }));
    return isValid;
  };

  const validateUpToStep = (targetStep: number) => {
    for (let step = 1; step < targetStep; step++) {
      if (!validateStep(step)) {
        return false;
      }
    }
    return true;
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep || validateUpToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleImageUpload = (url: string) => {
    // This function is called by ImageUploader component
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setFormData((prev: any) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async () => {
    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= steps.length; step++) {
      if (!validateStep(step)) {
        isValid = false;
        setCurrentStep(step);
        break;
      }
    }

    if (!isValid) return;

    // Don't proceed if any uploads are in progress
    if (isUploading) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Process form data to match server action schema
      const processedData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || undefined,
        shortDescription: formData.shortDescription?.trim() || undefined,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        sku: formData.sku?.trim() || undefined,
        barcode: formData.barcode?.trim() || undefined,
        category: formData.category || undefined,
        images: formData.images,
        tags: formData.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        features: formData.features
          .split(",")
          .map((feature: string) => feature.trim())
          .filter(Boolean),
        ingredients: formData.ingredients
          .split(",")
          .map((ingredient: string) => ingredient.trim())
          .filter(Boolean),
        nutritionFacts: Object.fromEntries(
          Object.entries(formData.nutritionFacts).filter(
            ([_, value]) => value !== ""
          )
        ),
        inventory: parseInt(formData.inventory) || 0,
        trackQuantity: formData.trackQuantity,
        allowBackorder: formData.allowBackorder,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dimensions: Object.keys(formData.dimensions).some(
          (key) => key !== "unit" && formData.dimensions[key] !== ""
        )
          ? {
              ...formData.dimensions,
              length: formData.dimensions.length
                ? parseFloat(formData.dimensions.length)
                : undefined,
              width: formData.dimensions.width
                ? parseFloat(formData.dimensions.width)
                : undefined,
              height: formData.dimensions.height
                ? parseFloat(formData.dimensions.height)
                : undefined,
            }
          : undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        metaTitle: formData.metaTitle?.trim() || undefined,
        metaDescription: formData.metaDescription?.trim() || undefined,
      };

      // Call real server actions
      let response;
      if (product?._id) {
        response = await updateProduct(product._id, processedData);
      } else {
        response = await createProduct(processedData);
      }

      if (response.success) {
        onSave();
      } else {
        throw new Error(response.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      // Add your error handling/notification system here
      // For example: toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`flex items-center cursor-pointer transition-all ${
              step.id <= currentStep ? "text-emerald-600" : "text-gray-400"
            } ${step.id === currentStep ? "scale-110" : ""}`}
            onClick={() => handleStepClick(step.id)}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                stepValidation[step.id] === true
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : step.id === currentStep
                    ? "border-emerald-600 bg-emerald-50 text-emerald-600 shadow-lg"
                    : step.id < currentStep
                      ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                      : "border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-500"
              }`}
            >
              {stepValidation[step.id] === true ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <step.icon className="h-6 w-6" />
              )}
            </div>
            <span
              className={`ml-3 text-sm font-medium hidden sm:block transition-colors ${
                step.id <= currentStep ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-4 transition-colors duration-300 ${
                step.id < currentStep ? "bg-emerald-600" : "bg-gray-300"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const ErrorMessage = ({ error }: { error?: string }) =>
    error ? (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1 animate-pulse">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    ) : null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Basic Information
              </h3>
              <p className="text-gray-600">
                Let's start with the essential product details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g., Berry Day Juice"
                />
                <ErrorMessage error={errors.name} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.slug ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="berry-day-juice"
                />
                <ErrorMessage error={errors.slug} />
                <p className="text-xs text-gray-500 mt-1">
                  This will be part of the product URL
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                  errors.shortDescription
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="A brief, compelling description for listings"
                maxLength={160}
              />
              <ErrorMessage error={errors.shortDescription} />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                rows={4}
                placeholder="Detailed product description with benefits, usage instructions, etc."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pricing & Inventory
              </h3>
              <p className="text-gray-600">
                Set your product pricing and stock levels
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.price
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <ErrorMessage error={errors.price} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare At Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        compareAtPrice: e.target.value,
                      }))
                    }
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.compareAtPrice
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <ErrorMessage error={errors.compareAtPrice} />
                <p className="text-xs text-gray-500 mt-1">
                  Original price for showing discounts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        costPrice: e.target.value,
                      }))
                    }
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your cost (for profit calculations)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="SKU will be generated automatically..."
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Generated from product name and category
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      barcode: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="123456789012"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inventory <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.inventory}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      inventory: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.inventory
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                <ErrorMessage error={errors.inventory} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackQuantity}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      trackQuantity: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Track Quantity
                  </span>
                  <p className="text-xs text-gray-500">Monitor stock levels</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowBackorder}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      allowBackorder: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Allow Backorders
                  </span>
                  <p className="text-xs text-gray-500">
                    Sell when out of stock
                  </p>
                </div>
              </label>
            </div>

            {/* Profit Margin Calculation */}
            {formData.price && formData.costPrice && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-medium text-emerald-900 mb-2">
                  Profit Analysis
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-700">Profit:</span>
                    <p className="font-bold text-emerald-900">
                      $
                      {(
                        parseFloat(formData.price) -
                        parseFloat(formData.costPrice)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Margin:</span>
                    <p className="font-bold text-emerald-900">
                      {(
                        ((parseFloat(formData.price) -
                          parseFloat(formData.costPrice)) /
                          parseFloat(formData.price)) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Markup:</span>
                    <p className="font-bold text-emerald-900">
                      {(
                        ((parseFloat(formData.price) -
                          parseFloat(formData.costPrice)) /
                          parseFloat(formData.costPrice)) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Product Images
              </h3>
              <p className="text-gray-600">
                Upload high-quality images to showcase your product
              </p>
            </div>

            {/* Upload Zone */}
            <ImageUploader
              imageUrl=""
              onFieldChange={handleImageUpload}
              setFiles={setImageFiles}
              uploading={isUploading}
              uploadProgress={uploadProgress}
            />

            <ErrorMessage error={errors.images} />

            {/* Image Grid */}
            {formData.images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Uploaded Images ({formData.images.length})
                  </h4>
                  <div className="text-sm text-gray-600">
                    Drag to reorder • First image is primary
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden bg-gray-100 cursor-move"
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", index.toString())
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(
                          e.dataTransfer.getData("text/plain")
                        );
                        moveImage(fromIndex, index);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Primary Badge */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 transform hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Move Buttons */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="p-1 bg-gray-800/70 text-white rounded hover:bg-gray-800"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="p-1 bg-gray-800/70 text-white rounded hover:bg-gray-800"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>Uploading images...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Image Guidelines
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use high-quality images (minimum 800x800px)</li>
                <li>• First image will be used as the primary product image</li>
                <li>• Show products from multiple angles for best results</li>
                <li>• Use consistent lighting and background</li>
                <li>• Include lifestyle shots showing product in use</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Product Details
              </h3>
              <p className="text-gray-600">
                Add detailed information about your product
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      ingredients: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    errors.ingredients
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="strawberry, blackberry, lemon, natural flavors"
                />
                <ErrorMessage error={errors.ingredients} />
                <p className="text-xs text-gray-500 mt-1">
                  Separate ingredients with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      features: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="cold-pressed, raw, no-sugar-added, organic"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Key features and benefits, separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="organic, natural, vitamin-c, antioxidant"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tags for search and categorization
                </p>
              </div>
            </div>

            {/* Nutrition Facts */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                Nutrition Facts (Optional)
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.servingSize}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          servingSize: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="12 fl oz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={formData.nutritionFacts.calories}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          calories: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Fat
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.totalFat}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          totalFat: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sodium
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.sodium}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          sodium: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="15mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Carbs
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.totalCarbs}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          totalCarbs: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="28g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sugars
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.sugars}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          sugars: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="25g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protein
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.protein}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          protein: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="1g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vitamin C
                  </label>
                  <input
                    type="text"
                    value={formData.nutritionFacts.vitaminC}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        nutritionFacts: {
                          ...prev.nutritionFacts,
                          vitaminC: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="100% DV"
                  />
                </div>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Physical Properties (Optional)
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (oz)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        weight: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dimensions.length}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          length: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          width: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          height: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.dimensions.unit}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions,
                        unit: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="in">Inches</option>
                  <option value="cm">Centimeters</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                SEO & Settings
              </h3>
              <p className="text-gray-600">
                Configure product visibility and search optimization
              </p>
            </div>

            {/* Product Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                Product Settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    {formData.isActive ? (
                      <Eye className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Active Product
                      </span>
                      <p className="text-xs text-gray-500">Show on website</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <Star
                      className={`h-4 w-4 ${
                        formData.isFeatured
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Featured Product
                      </span>
                      <p className="text-xs text-gray-500">
                        Show in featured sections
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                SEO Optimization
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      metaTitle: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Product Name - Nutra-Vive Organic"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  rows={3}
                  placeholder="A compelling description for search engines..."
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-600" />
                Search Result Preview
              </h4>

              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg text-blue-600 hover:underline cursor-pointer font-medium line-clamp-1">
                  {formData.metaTitle || formData.name}
                </h3>
                <p className="text-green-700 text-sm mb-2">
                  nutraviveholistic.com › products › {formData.slug}
                </p>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {formData.metaDescription || formData.shortDescription}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h4 className="font-medium text-emerald-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Product Summary
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-emerald-700">Name:</span>
                  <p className="font-medium text-emerald-900">
                    {formData.name || "Not set"}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700">Price:</span>
                  <p className="font-medium text-emerald-900">
                    ${formData.price || "0.00"}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700">Category:</span>
                  <p className="font-medium text-emerald-900">
                    {categories.find((cat) => cat._id === formData.category)
                      ?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700">Stock:</span>
                  <p className="font-medium text-emerald-900">
                    {formData.inventory} units
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700">Images:</span>
                  <p className="font-medium text-emerald-900">
                    {formData.images.length} uploaded
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700">Status:</span>
                  <p className="font-medium text-emerald-900">
                    {formData.isActive ? "Active" : "Inactive"}
                    {formData.isFeatured ? " • Featured" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return product ? "Updating..." : "Creating...";
    }

    if (isUploading) {
      return "Uploading images...";
    }

    return product ? "Update Product" : "Create Product";
  };

  const getButtonIcon = () => {
    if (isSubmitting || isUploading) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }

    return <Save className="h-5 w-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl p-6 border-b border-gray-200/50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {product ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-gray-600 text-sm">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Step Indicator */}
          <div className="p-6 pb-0">
            <StepIndicator />
          </div>

          {/* Form Content */}
          <div className="p-6 pb-8">{renderStep()}</div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl p-6 border-t border-gray-200/50 flex gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}

          <div className="flex-1" />

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonIcon()}
              {getButtonText()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
