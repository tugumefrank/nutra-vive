"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "../db";
import { User, Order, UserMembership, Membership } from "../db/models";
import mongoose from "mongoose";
import { sendEmail } from "../email";

// Types for customer analytics
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeSubscribers: number;
  highValueCustomers: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  color: string;
}

export interface CustomerData {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: string;
  createdAt: string;
  
  // Analytics data
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string | null;
  averageOrderValue: number;
  
  // Membership data
  activeMembership?: {
    membershipName: string;
    tier: string;
    status: string;
    startDate: string;
    nextBillingDate?: string | null;
  } | null;
  
  // Engagement data
  hasConsultations: boolean;
  reviewsCount: number;
  isEmailSubscriber: boolean;
  
  // Geographic data
  lastShippingLocation?: {
    city: string;
    province: string;
    country: string;
  } | null;
}

export interface BulkEmailData {
  subject: string;
  content: string;
  recipientType: 'all' | 'segment' | 'custom';
  segmentId?: string;
  customEmails?: string[];
  senderName?: string;
}

// Helper function to check admin access
async function checkAdminAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  await connectToDatabase();
  const user = await User.findOne({ clerkId: userId });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

// Get customer analytics overview
export async function getCustomerAnalytics(): Promise<CustomerAnalytics> {
  await checkAdminAuth();
  await connectToDatabase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomers,
    newCustomersThisMonth,
    activeSubscribers,
    highValueCustomers
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ 
      role: "user", 
      createdAt: { $gte: startOfMonth } 
    }),
    UserMembership.countDocuments({ 
      status: { $in: ["active", "trial"] } 
    }),
    // High value customers (>$500 total spent)
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: "$user", totalSpent: { $sum: "$totalAmount" } } },
      { $match: { totalSpent: { $gte: 500 } } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0)
  ]);

  return {
    totalCustomers,
    newCustomersThisMonth,
    activeSubscribers,
    highValueCustomers
  };
}

// Get customer segments with counts
export async function getCustomerSegments(): Promise<CustomerSegment[]> {
  await checkAdminAuth();
  await connectToDatabase();

  const now = new Date();
  const last30Days = new Date(now.setDate(now.getDate() - 30));
  const last90Days = new Date(now.setDate(now.getDate() - 90));

  // Run aggregation queries in parallel
  const [
    newCustomers,
    recurringCustomers,
    highValueCustomers,
    recentCustomers,
    dormantCustomers,
    activeBasicMembers,
    activePremiumMembers,
    activeVipMembers,
    activeEliteMembers,
    expiredMembers,
    consultationCustomers
  ] = await Promise.all([
    // New customers (first order in last 30 days)
    User.aggregate([
      { $lookup: { from: "orders", localField: "_id", foreignField: "user", as: "orders" } },
      { $match: { "orders.0": { $exists: true } } },
      { $addFields: { firstOrder: { $min: "$orders.createdAt" } } },
      { $match: { firstOrder: { $gte: last30Days } } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    // Recurring customers (2+ orders)
    User.aggregate([
      { $lookup: { from: "orders", localField: "_id", foreignField: "user", as: "orders" } },
      { $match: { $expr: { $gte: [{ $size: "$orders" }, 2] } } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    // High value customers
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: "$user", totalSpent: { $sum: "$totalAmount" } } },
      { $match: { totalSpent: { $gte: 500 } } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    // Recent customers (ordered in last 30 days)
    Order.distinct("user", { 
      createdAt: { $gte: last30Days },
      paymentStatus: "paid"
    }).then(users => users.length),

    // Dormant customers (no orders in 90+ days)
    User.aggregate([
      { $lookup: { from: "orders", localField: "_id", foreignField: "user", as: "orders" } },
      { $match: { "orders.0": { $exists: true } } },
      { $addFields: { lastOrder: { $max: "$orders.createdAt" } } },
      { $match: { lastOrder: { $lt: last90Days } } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    // Active membership segments
    UserMembership.aggregate([
      { $lookup: { from: "memberships", localField: "membership", foreignField: "_id", as: "membershipData" } },
      { $match: { status: { $in: ["active", "trial"] }, "membershipData.tier": "basic" } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    UserMembership.aggregate([
      { $lookup: { from: "memberships", localField: "membership", foreignField: "_id", as: "membershipData" } },
      { $match: { status: { $in: ["active", "trial"] }, "membershipData.tier": "premium" } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    UserMembership.aggregate([
      { $lookup: { from: "memberships", localField: "membership", foreignField: "_id", as: "membershipData" } },
      { $match: { status: { $in: ["active", "trial"] }, "membershipData.tier": "vip" } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    UserMembership.aggregate([
      { $lookup: { from: "memberships", localField: "membership", foreignField: "_id", as: "membershipData" } },
      { $match: { status: { $in: ["active", "trial"] }, "membershipData.tier": "elite" } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0),

    // Expired members
    UserMembership.countDocuments({ 
      status: { $in: ["cancelled", "expired"] } 
    }),

    // Customers with consultations
    User.aggregate([
      { $lookup: { from: "consultations", localField: "_id", foreignField: "user", as: "consultations" } },
      { $match: { "consultations.0": { $exists: true } } },
      { $count: "count" }
    ]).then(result => result[0]?.count || 0)
  ]);

  return [
    {
      id: "new_customers",
      name: "New Customers",
      description: "First order in last 30 days",
      count: newCustomers,
      color: "#10B981"
    },
    {
      id: "recurring_customers", 
      name: "Recurring Customers",
      description: "2+ orders placed",
      count: recurringCustomers,
      color: "#3B82F6"
    },
    {
      id: "high_value_customers",
      name: "High Value Customers", 
      description: "$500+ total spent",
      count: highValueCustomers,
      color: "#F59E0B"
    },
    {
      id: "recent_customers",
      name: "Recent Customers",
      description: "Ordered in last 30 days", 
      count: recentCustomers,
      color: "#8B5CF6"
    },
    {
      id: "dormant_customers",
      name: "Dormant Customers",
      description: "No orders in 90+ days",
      count: dormantCustomers, 
      color: "#EF4444"
    },
    {
      id: "basic_members",
      name: "Basic Members",
      description: "Active basic membership",
      count: activeBasicMembers,
      color: "#6B7280"
    },
    {
      id: "premium_members", 
      name: "Premium Members",
      description: "Active premium membership",
      count: activePremiumMembers,
      color: "#059669"
    },
    {
      id: "vip_members",
      name: "VIP Members", 
      description: "Active VIP membership",
      count: activeVipMembers,
      color: "#DC2626"
    },
    {
      id: "elite_members",
      name: "Elite Members",
      description: "Active elite membership", 
      count: activeEliteMembers,
      color: "#7C2D12"
    },
    {
      id: "expired_members",
      name: "Expired Members",
      description: "Cancelled/expired memberships",
      count: expiredMembers,
      color: "#9CA3AF"
    },
    {
      id: "consultation_customers",
      name: "Consultation Customers", 
      description: "Booked consultations",
      count: consultationCustomers,
      color: "#0891B2"
    }
  ];
}

// Get customers with analytics data
export async function getCustomersWithAnalytics(
  page: number = 1,
  limit: number = 50,
  search?: string,
  segmentId?: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<{ customers: CustomerData[]; totalCount: number; totalPages: number }> {
  await checkAdminAuth();
  await connectToDatabase();

  let matchStage: any = { role: "user" };

  // Add search filter
  if (search) {
    matchStage.$or = [
      { email: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } }
    ];
  }

  // Build aggregation pipeline
  let pipeline: any[] = [
    { $match: matchStage },
    
    // Lookup orders
    {
      $lookup: {
        from: "orders",
        localField: "_id", 
        foreignField: "user",
        as: "orders"
      }
    },
    
    // Lookup memberships
    {
      $lookup: {
        from: "usermemberships",
        localField: "_id",
        foreignField: "user", 
        as: "memberships"
      }
    },
    
    // Lookup active membership details
    {
      $lookup: {
        from: "memberships",
        localField: "memberships.membership",
        foreignField: "_id",
        as: "membershipDetails"
      }
    },
    
    // Add calculated fields
    {
      $addFields: {
        totalOrders: { $size: "$orders" },
        totalSpent: {
          $sum: {
            $map: {
              input: { $filter: { input: "$orders", cond: { $eq: ["$$this.paymentStatus", "paid"] } } },
              as: "order",
              in: "$$order.totalAmount"
            }
          }
        },
        lastOrderDate: { $max: "$orders.createdAt" },
        averageOrderValue: {
          $let: {
            vars: {
              paidOrders: { $filter: { input: "$orders", cond: { $eq: ["$$this.paymentStatus", "paid"] } } }
            },
            in: {
              $cond: {
                if: { $gt: [{ $size: "$$paidOrders" }, 0] },
                then: {
                  $divide: [
                    {
                      $sum: {
                        $map: {
                          input: "$$paidOrders",
                          as: "order", 
                          in: "$$order.totalAmount"
                        }
                      }
                    },
                    { $size: "$$paidOrders" }
                  ]
                },
                else: 0
              }
            }
          }
        },
        activeMembership: {
          $let: {
            vars: {
              activeMembership: {
                $arrayElemAt: [
                  { $filter: { input: "$memberships", cond: { $eq: ["$$this.status", "active"] } } },
                  0
                ]
              }
            },
            in: {
              $cond: {
                if: { $ne: ["$$activeMembership", null] },
                then: {
                  membershipName: { $arrayElemAt: ["$membershipDetails.name", 0] },
                  tier: { $arrayElemAt: ["$membershipDetails.tier", 0] },
                  status: "$$activeMembership.status",
                  startDate: "$$activeMembership.startDate",
                  nextBillingDate: "$$activeMembership.nextBillingDate"
                },
                else: null
              }
            }
          }
        },
        lastShippingLocation: {
          $let: {
            vars: {
              lastOrder: {
                $arrayElemAt: [
                  { $sortArray: { input: "$orders", sortBy: { createdAt: -1 } } },
                  0
                ]
              }
            },
            in: {
              $cond: {
                if: { $ne: ["$$lastOrder", null] },
                then: {
                  city: "$$lastOrder.shippingAddress.city",
                  province: "$$lastOrder.shippingAddress.province", 
                  country: "$$lastOrder.shippingAddress.country"
                },
                else: null
              }
            }
          }
        }
      }
    }
  ];

  // Add segment filtering
  if (segmentId) {
    const now = new Date();
    const last30Days = new Date(now.setDate(now.getDate() - 30));
    const last90Days = new Date(now.setDate(now.getDate() - 90));

    switch (segmentId) {
      case "new_customers":
        pipeline.push({
          $match: {
            totalOrders: { $gte: 1 },
            $expr: { $gte: [{ $min: "$orders.createdAt" }, last30Days] }
          }
        });
        break;
      case "recurring_customers":
        pipeline.push({ $match: { totalOrders: { $gte: 2 } } });
        break;
      case "high_value_customers":
        pipeline.push({ $match: { totalSpent: { $gte: 500 } } });
        break;
      case "recent_customers":
        pipeline.push({ $match: { lastOrderDate: { $gte: last30Days } } });
        break;
      case "dormant_customers":
        pipeline.push({
          $match: {
            totalOrders: { $gte: 1 },
            lastOrderDate: { $lt: last90Days }
          }
        });
        break;
      case "basic_members":
        pipeline.push({ $match: { "activeMembership.tier": "basic" } });
        break;
      case "premium_members":
        pipeline.push({ $match: { "activeMembership.tier": "premium" } });
        break;
      case "vip_members":
        pipeline.push({ $match: { "activeMembership.tier": "vip" } });
        break;
      case "elite_members":
        pipeline.push({ $match: { "activeMembership.tier": "elite" } });
        break;
      case "expired_members":
        pipeline.push({
          $lookup: {
            from: "usermemberships",
            localField: "_id",
            foreignField: "user",
            as: "expiredMemberships"
          }
        });
        pipeline.push({
          $match: {
            "expiredMemberships.status": { $in: ["cancelled", "expired"] }
          }
        });
        break;
    }
  }

  // Add sorting
  const sortStage: any = {};
  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: sortStage });

  // Get total count
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await User.aggregate(countPipeline);
  const totalCount = countResult[0]?.total || 0;

  // Add pagination
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // Execute query
  const customers = await User.aggregate(pipeline);

  // Serialize MongoDB objects to plain objects
  const serializedCustomers = customers.map(customer => ({
    _id: customer._id.toString(),
    clerkId: customer.clerkId,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    imageUrl: customer.imageUrl,
    role: customer.role,
    createdAt: customer.createdAt instanceof Date ? customer.createdAt.toISOString() : customer.createdAt,
    totalOrders: customer.totalOrders || 0,
    totalSpent: customer.totalSpent || 0,
    lastOrderDate: customer.lastOrderDate ? (customer.lastOrderDate instanceof Date ? customer.lastOrderDate.toISOString() : customer.lastOrderDate) : null,
    averageOrderValue: customer.averageOrderValue || 0,
    activeMembership: customer.activeMembership ? {
      membershipName: customer.activeMembership.membershipName,
      tier: customer.activeMembership.tier,
      status: customer.activeMembership.status,
      startDate: customer.activeMembership.startDate instanceof Date ? customer.activeMembership.startDate.toISOString() : customer.activeMembership.startDate,
      nextBillingDate: customer.activeMembership.nextBillingDate ? (customer.activeMembership.nextBillingDate instanceof Date ? customer.activeMembership.nextBillingDate.toISOString() : customer.activeMembership.nextBillingDate) : null
    } : null,
    lastShippingLocation: customer.lastShippingLocation ? {
      city: customer.lastShippingLocation.city,
      province: customer.lastShippingLocation.province,
      country: customer.lastShippingLocation.country
    } : null,
    hasConsultations: false, // TODO: Add consultation lookup
    reviewsCount: 0, // TODO: Add reviews lookup
    isEmailSubscriber: true // TODO: Add newsletter subscription lookup
  }));

  return {
    customers: serializedCustomers,
    totalCount,
    totalPages: Math.ceil(totalCount / limit)
  };
}

// Send bulk email to customers
export async function sendBulkEmail(emailData: BulkEmailData): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
  await checkAdminAuth();
  await connectToDatabase();

  let recipients: string[] = [];

  if (emailData.recipientType === 'all') {
    const users = await User.find({ role: "user" }, { email: 1 });
    recipients = users.map(user => user.email);
  } else if (emailData.recipientType === 'segment' && emailData.segmentId) {
    const { customers } = await getCustomersWithAnalytics(1, 10000, undefined, emailData.segmentId);
    recipients = customers.map(customer => customer.email);
  } else if (emailData.recipientType === 'custom' && emailData.customEmails) {
    recipients = emailData.customEmails;
  }

  let sentCount = 0;
  let failedCount = 0;

  // Send emails in batches to avoid rate limits
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (email) => {
      try {
        await sendEmail({
          to: email,
          subject: emailData.subject,
          template: "bulk-email", // We'll need to create this template
          data: {
            content: emailData.content,
            senderName: emailData.senderName || "Nutra-Vive Team"
          }
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        failedCount++;
      }
    });

    await Promise.allSettled(promises);
    
    // Add small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: failedCount === 0,
    sentCount,
    failedCount
  };
}

// Export customer data
export async function exportCustomerData(segmentId?: string, format: 'csv' | 'json' = 'csv') {
  await checkAdminAuth();
  
  const { customers } = await getCustomersWithAnalytics(1, 10000, undefined, segmentId);
  
  if (format === 'json') {
    return JSON.stringify(customers, null, 2);
  }
  
  // CSV format
  const headers = [
    'Email', 'First Name', 'Last Name', 'Total Orders', 'Total Spent', 
    'Last Order Date', 'Average Order Value', 'Membership Status', 'Membership Tier',
    'City', 'Province', 'Country', 'Created Date'
  ];
  
  const csvRows = [
    headers.join(','),
    ...customers.map(customer => [
      customer.email,
      customer.firstName || '',
      customer.lastName || '',
      customer.totalOrders,
      customer.totalSpent.toFixed(2),
      customer.lastOrderDate ? new Date(customer.lastOrderDate).toISOString().split('T')[0] : '',
      customer.averageOrderValue.toFixed(2),
      customer.activeMembership?.status || 'None',
      customer.activeMembership?.tier || 'None',
      customer.lastShippingLocation?.city || '',
      customer.lastShippingLocation?.province || '',
      customer.lastShippingLocation?.country || '',
      new Date(customer.createdAt).toISOString().split('T')[0]
    ].join(','))
  ];
  
  return csvRows.join('\n');
}