"use client";

import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Users, Percent, DollarSign, Plus, Minus, Clock, Calendar, Timer } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category?: string;
  images?: string[];
}

interface ProductDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DiscountType = 'percentage' | 'fixed_amount';
type AssignmentScope = 'all_products' | 'categories' | 'specific_products';
type ScheduleType = 'immediate' | 'scheduled';
type DurationUnit = 'hours' | 'days' | 'weeks' | 'months';

export default function ProductDiscountModal({ isOpen, onClose }: ProductDiscountModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [discountName, setDiscountName] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [assignmentScope, setAssignmentScope] = useState<AssignmentScope>('all_products');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Enhanced timing and scheduling state
  const [scheduleType, setScheduleType] = useState<ScheduleType>('immediate');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hasDuration, setHasDuration] = useState(false);
  const [durationAmount, setDurationAmount] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [autoDisable, setAutoDisable] = useState(false);
  const [priority, setPriority] = useState<number>(0);
  const [canStack, setCanStack] = useState(false);
  const [notes, setNotes] = useState('');

  // Load categories and products
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

      // Load products
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load categories and products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discountName.trim()) {
      toast.error('Please enter a discount name');
      return;
    }

    if (discountValue <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (assignmentScope === 'categories' && selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    if (assignmentScope === 'specific_products' && selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate start and end dates
      let startsAt = new Date();
      if (scheduleType === 'scheduled') {
        if (!startDate) {
          toast.error('Please select a start date for scheduled discount');
          return;
        }
        const dateTime = startTime ? `${startDate}T${startTime}` : `${startDate}T00:00`;
        startsAt = new Date(dateTime);
      }
      
      let endsAt = undefined;
      if (hasDuration && durationAmount > 0) {
        endsAt = new Date(startsAt);
        switch (durationUnit) {
          case 'hours':
            endsAt.setHours(endsAt.getHours() + durationAmount);
            break;
          case 'days':
            endsAt.setDate(endsAt.getDate() + durationAmount);
            break;
          case 'weeks':
            endsAt.setDate(endsAt.getDate() + (durationAmount * 7));
            break;
          case 'months':
            endsAt.setMonth(endsAt.getMonth() + durationAmount);
            break;
        }
      }
      
      console.log('🔍 Submitting discount form with:', {
        name: discountName,
        discountType,
        discountValue,
        scope: assignmentScope,
        categoryIds: assignmentScope === 'categories' ? selectedCategories : undefined,
        productIds: assignmentScope === 'specific_products' ? selectedProducts : undefined,
        scheduleType,
        startsAt,
        endsAt,
        autoDisable,
        priority,
        canStackWithOtherDiscounts: canStack,
        notes,
        duration: hasDuration ? { amount: durationAmount, unit: durationUnit } : undefined,
      });

      const { createProductDiscount } = await import('@/lib/actions/promotionServerActions');
      
      const result = await createProductDiscount({
        name: discountName,
        discountType,
        discountValue,
        scope: assignmentScope,
        categoryIds: assignmentScope === 'categories' ? selectedCategories : undefined,
        productIds: assignmentScope === 'specific_products' ? selectedProducts : undefined,
        scheduleType,
        startsAt,
        endsAt,
        autoDisable,
        priority,
        canStackWithOtherDiscounts: canStack,
        notes,
        duration: hasDuration ? { amount: durationAmount, unit: durationUnit } : undefined,
      });

      console.log('🔍 Server response:', result);

      if (result.success) {
        toast.success(`Discount applied to ${result.affectedCount} products successfully!`);
        handleClose();
      } else {
        console.error('❌ Server returned error:', result.error);
        toast.error(result.error || 'Failed to apply discounts');
      }
    } catch (error) {
      console.error('❌ Client error applying discounts:', error);
      toast.error(`Failed to apply discounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDiscountName('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setAssignmentScope('all_products');
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSearchTerm('');
    setScheduleType('immediate');
    setStartDate('');
    setStartTime('');
    setHasDuration(false);
    setDurationAmount(1);
    setDurationUnit('days');
    setAutoDisable(false);
    setPriority(0);
    setCanStack(false);
    setNotes('');
    onClose();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Apply Product Discounts</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set compareAtPrice discounts for products and categories
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Discount Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Name</label>
                  <input
                    type="text"
                    value={discountName}
                    onChange={(e) => setDiscountName(e.target.value)}
                    placeholder="e.g., Summer Sale 2024"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="max-w-xs">
                <label className="block text-sm font-medium mb-2">
                  Discount Value
                  {discountType === 'percentage' ? ' (%)' : ' ($)'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountValue(Math.max(0, discountValue - (discountType === 'percentage' ? 5 : 1)))}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min="0"
                    max={discountType === 'percentage' ? 100 : undefined}
                    step={discountType === 'percentage' ? 5 : 1}
                    className="w-24 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setDiscountValue(discountValue + (discountType === 'percentage' ? 5 : 1))}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {discountType === 'percentage' ? '%' : '$'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment Scope */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignment Scope
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="scope"
                    value="all_products"
                    checked={assignmentScope === 'all_products'}
                    onChange={(e) => setAssignmentScope(e.target.value as AssignmentScope)}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium">All Products</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Apply discount to all products in the store
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="scope"
                    value="categories"
                    checked={assignmentScope === 'categories'}
                    onChange={(e) => setAssignmentScope(e.target.value as AssignmentScope)}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium">Specific Categories</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Apply discount to selected categories (you can choose multiple)
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="scope"
                    value="specific_products"
                    checked={assignmentScope === 'specific_products'}
                    onChange={(e) => setAssignmentScope(e.target.value as AssignmentScope)}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium">Specific Products</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Apply discount to individually selected products
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Category Selection */}
            {assignmentScope === 'categories' && (
              <div className="space-y-4">
                <h4 className="font-medium">Select Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryToggle(category._id)}
                        className="text-green-600"
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-sm text-green-600">
                    {selectedCategories.length} categories selected
                  </p>
                )}
              </div>
            )}

            {/* Product Selection */}
            {assignmentScope === 'specific_products' && (
              <div className="space-y-4">
                <h4 className="font-medium">Select Products</h4>
                
                <div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <label
                      key={product._id}
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleProductToggle(product._id)}
                        className="text-green-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {selectedProducts.length > 0 && (
                  <p className="text-sm text-green-600">
                    {selectedProducts.length} products selected
                  </p>
                )}
              </div>
            )}

            {/* Scheduling & Timing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Scheduling & Timing
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="schedule"
                    value="immediate"
                    checked={scheduleType === 'immediate'}
                    onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium">Start Immediately</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Apply discount right away
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input
                    type="radio"
                    name="schedule"
                    value="scheduled"
                    checked={scheduleType === 'scheduled'}
                    onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                    className="text-green-600"
                  />
                  <div>
                    <div className="font-medium">Schedule for Later</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Set a specific start date and time
                    </div>
                  </div>
                </label>
              </div>

              {scheduleType === 'scheduled' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time (Optional)</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                    />
                  </div>
                </div>
              )}

              {/* Duration Settings */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasDuration}
                    onChange={(e) => setHasDuration(e.target.checked)}
                    className="text-green-600"
                  />
                  <span className="font-medium">Set Duration (Auto-expire)</span>
                </label>

                {hasDuration && (
                  <div className="ml-6 grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <input
                        type="number"
                        value={durationAmount}
                        onChange={(e) => setDurationAmount(Number(e.target.value))}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit</label>
                      <select
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                      >
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Advanced Options
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                  >
                    <option value={0}>Normal (0)</option>
                    <option value={1}>High (1)</option>
                    <option value={2}>Higher (2)</option>
                    <option value={3}>Highest (3)</option>
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Higher priority discounts apply first
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={canStack}
                      onChange={(e) => setCanStack(e.target.checked)}
                      className="text-green-600"
                    />
                    <span className="text-sm font-medium">Allow Stacking</span>
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    Can combine with other discounts
                  </p>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={autoDisable}
                      onChange={(e) => setAutoDisable(e.target.checked)}
                      className="text-green-600"
                    />
                    <span className="text-sm font-medium">Auto-disable when expired</span>
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    Automatically deactivate when duration ends
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this discount..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Applying...
                </>
              ) : (
                <>
                  <Percent className="w-4 h-4" />
                  Apply Discounts
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}