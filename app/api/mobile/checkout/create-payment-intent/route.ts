// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { z } from "zod";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-05-28.basil",
// });

// // Validation schema for checkout request
// const checkoutSchema = z.object({
//   // Cart items
//   items: z.array(
//     z.object({
//       productId: z.string(),
//       quantity: z.number().min(1),
//       price: z.number().min(0),
//       name: z.string(),
//     })
//   ),

//   // Pricing
//   subtotal: z.number().min(0),
//   taxAmount: z.number().min(0).default(0),
//   shippingAmount: z.number().min(0).default(0),
//   discountAmount: z.number().min(0).default(0),
//   totalAmount: z.number().min(0),
//   currency: z.string().default("usd"),

//   // Customer info
//   customer: z.object({
//     email: z.string().email(),
//     firstName: z.string().min(1),
//     lastName: z.string().min(1),
//     phone: z.string().optional(),
//   }),

//   // Shipping address
//   shippingAddress: z.object({
//     line1: z.string().min(1),
//     line2: z.string().optional(),
//     city: z.string().min(1),
//     state: z.string().min(1),
//     postal_code: z.string().min(1),
//     country: z.string().default("US"),
//   }),

//   // Billing address (optional, defaults to shipping)
//   billingAddress: z
//     .object({
//       line1: z.string().min(1),
//       line2: z.string().optional(),
//       city: z.string().min(1),
//       state: z.string().min(1),
//       postal_code: z.string().min(1),
//       country: z.string().default("US"),
//     })
//     .optional(),

//   // Applied promotions/discounts
//   appliedPromotion: z
//     .object({
//       code: z.string(),
//       name: z.string(),
//       discountAmount: z.number(),
//       promotionId: z.string(),
//     })
//     .optional(),

//   // Membership info
//   membershipInfo: z
//     .object({
//       membershipId: z.string(),
//       membershipDiscount: z.number(),
//       freeItems: z.array(
//         z.object({
//           productId: z.string(),
//           quantity: z.number(),
//         })
//       ),
//     })
//     .optional(),

//   // Payment method types (optional)
//   paymentMethodTypes: z.array(z.string()).default(["card"]),

//   // Special instructions
//   notes: z.string().optional(),
// });

// type CheckoutRequest = z.infer<typeof checkoutSchema>;

// /**
//  * Mobile API: Create Stripe Payment Intent
//  * POST /api/mobile/checkout/create-payment-intent
//  */
// export async function POST(request: NextRequest) {
//   console.log(
//     "🔵 Mobile API: POST /api/mobile/checkout/create-payment-intent called"
//   );

//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       console.log("❌ Unauthorized access attempt");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log("👤 User ID:", userId);

//     const body = await request.json();
//     console.log("📋 Checkout request body:", JSON.stringify(body, null, 2));

//     // Validate request data
//     const validatedData = checkoutSchema.parse(body);
//     console.log("✅ Checkout data validated successfully");

//     // Get or create Stripe customer
//     let stripeCustomer;
//     try {
//       // Check if customer already exists
//       const existingCustomers = await stripe.customers.list({
//         email: validatedData.customer.email,
//         limit: 1,
//       });

//       if (existingCustomers.data.length > 0) {
//         stripeCustomer = existingCustomers.data[0];
//         console.log("👤 Found existing Stripe customer:", stripeCustomer.id);
//       } else {
//         // Create new customer
//         stripeCustomer = await stripe.customers.create({
//           email: validatedData.customer.email,
//           name: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
//           phone: validatedData.customer.phone,
//           address: validatedData.shippingAddress,
//           metadata: {
//             clerkUserId: userId,
//             source: "mobile_app",
//           },
//         });
//         console.log("👤 Created new Stripe customer:", stripeCustomer.id);
//       }
//     } catch (customerError) {
//       console.error("❌ Customer creation/lookup failed:", customerError);
//       return NextResponse.json(
//         { error: "Failed to process customer information" },
//         { status: 500 }
//       );
//     }

//     // Calculate final amount (in cents for Stripe)
//     const amountInCents = Math.round(validatedData.totalAmount * 100);
//     console.log("💰 Payment amount:", amountInCents, "cents");

//     // Create Payment Intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: validatedData.currency,
//       customer: stripeCustomer.id,

//       // Metadata for tracking
//       metadata: {
//         clerkUserId: userId,
//         orderSource: "mobile_app",
//         subtotal: validatedData.subtotal.toString(),
//         taxAmount: validatedData.taxAmount.toString(),
//         shippingAmount: validatedData.shippingAmount.toString(),
//         discountAmount: validatedData.discountAmount.toString(),
//         itemCount: validatedData.items.length.toString(),
//         promotionCode: validatedData.appliedPromotion?.code || "",
//         membershipDiscount:
//           validatedData.membershipInfo?.membershipDiscount.toString() || "0",
//       },

//       // Shipping information
//       shipping: {
//         name: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
//         phone: validatedData.customer.phone,
//         address: validatedData.shippingAddress,
//       },

//       // Use automatic payment methods (recommended for mobile)
//       automatic_payment_methods: {
//         enabled: true,
//       },

//       // Capture method (capture immediately when confirmed)
//       capture_method: "automatic",
//     });

//     console.log("✅ Payment Intent created:", paymentIntent.id);

//     // Prepare response for mobile app
//     const response = {
//       success: true,
//       paymentIntent: {
//         id: paymentIntent.id,
//         clientSecret: paymentIntent.client_secret,
//         amount: paymentIntent.amount,
//         currency: paymentIntent.currency,
//         status: paymentIntent.status,
//       },
//       customer: {
//         id: stripeCustomer.id,
//         email: stripeCustomer.email,
//       },
//       orderSummary: {
//         subtotal: validatedData.subtotal,
//         taxAmount: validatedData.taxAmount,
//         shippingAmount: validatedData.shippingAmount,
//         discountAmount: validatedData.discountAmount,
//         totalAmount: validatedData.totalAmount,
//         currency: validatedData.currency,
//         items: validatedData.items,
//         appliedPromotion: validatedData.appliedPromotion,
//         membershipInfo: validatedData.membershipInfo,
//       },
//     };

//     console.log("📤 Payment Intent response sent successfully");
//     console.log("💳 Client secret provided for mobile confirmation");

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("❌ Create payment intent error:", error);

//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           error: "Invalid checkout data",
//           details: error.errors,
//         },
//         { status: 400 }
//       );
//     }

//     if (error instanceof Stripe.errors.StripeError) {
//       return NextResponse.json(
//         {
//           error: "Payment processing error",
//           message: error.message,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Failed to create payment intent" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db"; // Assuming your db connection path
import { Order, User } from "@/lib/db/models"; // Assuming your models path

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Validation schema for checkout request
const checkoutSchema = z.object({
  // Cart items
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
      name: z.string(),
      slug: z.string().min(1), // Required to match Order model
      image: z.string().min(1), // Required to match Order model
      originalPrice: z.number().min(0).optional(),
      totalSavings: z.number().min(0).optional(),
    })
  ),

  // Pricing
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  shippingAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  currency: z.string().default("usd"),

  // Customer info
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
  }),

  // Shipping address
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().default("US"),
  }),

  // Billing address (optional, defaults to shipping)
  billingAddress: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().default("US"),
    })
    .optional(),

  // Applied promotions/discounts
  appliedPromotion: z
    .object({
      code: z.string(),
      name: z.string(),
      discountAmount: z.number(),
      promotionId: z.string(),
    })
    .optional(),

  // Membership info - keep if you have this logic
  membershipInfo: z
    .object({
      membershipId: z.string(),
      membershipDiscount: z.number(),
      freeItems: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number(),
        })
      ),
    })
    .optional(),

  // Payment method types (optional)
  paymentMethodTypes: z.array(z.string()).default(["card"]),

  // Special instructions
  notes: z.string().optional(),

  // **REQUIRED FIELD**
  deliveryMethod: z.enum(["standard", "express", "pickup"]),
});

type CheckoutRequest = z.infer<typeof checkoutSchema>;

// Helper function to generate unique order number (re-using from orderServerActions)
async function generateOrderNumber(): Promise<string> {
  await connectToDatabase();
  const count = await Order.countDocuments();
  const orderNumber = `NV-${(count + 1).toString().padStart(6, "0")}`;

  // Check if order number already exists (just in case)
  const existingOrder = await Order.findOne({ orderNumber });
  if (existingOrder) {
    return `NV-${Date.now().toString().slice(-6)}`;
  }

  return orderNumber;
}

/**
 * Mobile API: Create Stripe Payment Intent
 * POST /api/mobile/checkout/create-payment-intent
 */
export async function POST(request: NextRequest) {
  console.log(
    "🔵 Mobile API: POST /api/mobile/checkout/create-payment-intent called"
  );

  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("👤 User ID:", userId);

    const body = await request.json();
    console.log(
      "📋 Original Checkout request body:",
      JSON.stringify(body, null, 2)
    );

    // 🚀 **MANUAL ADDITION FOR TESTING:** Add deliveryMethod if it's missing 🚀
    if (!body.deliveryMethod) {
      console.warn(
        "⚠️ deliveryMethod missing in request body. Manually adding for testing."
      );
      body.deliveryMethod = "standard"; // Or "express", "pickup" as needed for your test
    }
    // 🚀 END MANUAL ADDITION 🚀

    // Validate request data
    const validatedData = checkoutSchema.parse(body);
    console.log("✅ Checkout data validated successfully");

    await connectToDatabase(); // Ensure DB connection is established

    // Get or create Stripe customer
    let stripeCustomer;
    try {
      // Check if customer already exists in Stripe
      const existingCustomers = await stripe.customers.list({
        email: validatedData.customer.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomer = existingCustomers.data[0];
        console.log("👤 Found existing Stripe customer:", stripeCustomer.id);
      } else {
        // Create new customer in Stripe
        stripeCustomer = await stripe.customers.create({
          email: validatedData.customer.email,
          name: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
          phone: validatedData.customer.phone,
          address: {
            line1: validatedData.shippingAddress.line1,
            line2: validatedData.shippingAddress.line2,
            city: validatedData.shippingAddress.city,
            state: validatedData.shippingAddress.state,
            postal_code: validatedData.shippingAddress.postal_code,
            country: validatedData.shippingAddress.country,
          },
          metadata: {
            clerkUserId: userId,
            source: "mobile_app",
          },
        });
        console.log("👤 Created new Stripe customer:", stripeCustomer.id);
      }
    } catch (customerError) {
      console.error(
        "❌ Stripe customer creation/lookup failed:",
        customerError
      );
      return NextResponse.json(
        { error: "Failed to process customer information with Stripe" },
        { status: 500 }
      );
    }

    // Calculate final amount (in cents for Stripe)
    const amountInCents = Math.round(validatedData.totalAmount * 100);
    console.log(
      "💰 Payment amount for Payment Intent:",
      amountInCents,
      "cents"
    );

    // Generate a unique order number
    const orderNumber = await generateOrderNumber();
    console.log("📝 Generated new order number:", orderNumber);

    // 🌟🌟🌟 CRUCIAL STEP: Create a pending order in your database 🌟🌟🌟
    const newOrder = new Order({
      orderNumber,
      user: null, // Placeholder, will attempt to link to user below
      email: validatedData.customer.email,
      status: "pending", // Initial status
      paymentStatus: "pending", // Initial payment status
      subtotal: validatedData.subtotal,
      taxAmount: validatedData.taxAmount,
      shippingAmount: validatedData.shippingAmount,
      discountAmount: validatedData.discountAmount,
      totalAmount: validatedData.totalAmount,
      currency: validatedData.currency,
      shippingAddress: {
        firstName: validatedData.customer.firstName,
        lastName: validatedData.customer.lastName,
        address1: validatedData.shippingAddress.line1,
        address2: validatedData.shippingAddress.line2,
        city: validatedData.shippingAddress.city,
        province: validatedData.shippingAddress.state, // Map 'state' to 'province' for consistency
        zip: validatedData.shippingAddress.postal_code, // Map 'postal_code' to 'zip'
        country: validatedData.shippingAddress.country,
        phone: validatedData.customer.phone,
      },
      billingAddress: validatedData.billingAddress
        ? {
            firstName: validatedData.customer.firstName,
            lastName: validatedData.customer.lastName,
            address1: validatedData.billingAddress.line1,
            address2: validatedData.billingAddress.line2,
            city: validatedData.billingAddress.city,
            province: validatedData.billingAddress.state,
            zip: validatedData.billingAddress.postal_code,
            country: validatedData.billingAddress.country,
            phone: validatedData.customer.phone,
          }
        : {
            // If billing address is not provided, use shipping address for consistency
            firstName: validatedData.customer.firstName,
            lastName: validatedData.customer.lastName,
            address1: validatedData.shippingAddress.line1,
            address2: validatedData.shippingAddress.line2,
            city: validatedData.shippingAddress.city,
            province: validatedData.shippingAddress.state,
            zip: validatedData.shippingAddress.postal_code,
            country: validatedData.shippingAddress.country,
            phone: validatedData.customer.phone,
          },
      items: validatedData.items.map((item) => ({
        product: item.productId, // Store product ID as reference
        productName: item.name,
        productSlug: item.slug, // Now required
        productImage: item.image, // Now required
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        totalPrice: item.quantity * item.price,
        appliedDiscount: item.totalSavings || 0,
      })),
      notes: validatedData.notes,
      deliveryMethod: validatedData.deliveryMethod,
      appliedPromotion: validatedData.appliedPromotion
        ? {
            promotionId: validatedData.appliedPromotion.promotionId,
            code: validatedData.appliedPromotion.code,
            name: validatedData.appliedPromotion.name,
            discountAmount: validatedData.appliedPromotion.discountAmount,
            discountType: "percentage", // Assuming fixed type or needs to come from client
          }
        : undefined,
      // No paymentIntentId yet, will be set after Stripe creates it
    });

    // Attempt to link the order to an existing user in your database
    try {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        newOrder.user = user._id;
        console.log("✅ Order linked to existing user in DB:", user._id);
      } else {
        console.log(
          "⚠️ User not found in local DB, order will be unlinked (guest order)."
        );
      }
    } catch (userLookupError) {
      console.error("❌ Error looking up user for order:", userLookupError);
    }

    await newOrder.save();
    console.log(
      "✅ Pending order created in database with ID:",
      newOrder._id,
      "Order Number:",
      newOrder.orderNumber
    );

    // Create Payment Intent with orderId in metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: validatedData.currency,
      customer: stripeCustomer.id,

      // Metadata for tracking, now including orderId
      metadata: {
        clerkUserId: userId,
        orderSource: "mobile_app",
        orderId: newOrder._id.toString(), // 🌟🌟🌟 Store the generated order ID here 🌟🌟🌟
        orderNumber: newOrder.orderNumber, // Also useful to include
        subtotal: validatedData.subtotal.toString(),
        taxAmount: validatedData.taxAmount.toString(),
        shippingAmount: validatedData.shippingAmount.toString(),
        discountAmount: validatedData.discountAmount.toString(),
        totalAmount: validatedData.totalAmount.toString(),
        itemCount: validatedData.items.length.toString(),
        promotionCode: validatedData.appliedPromotion?.code || "",
        membershipDiscount:
          validatedData.membershipInfo?.membershipDiscount.toString() || "0",
      },

      // Shipping information
      shipping: {
        name: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
        phone: validatedData.customer.phone,
        address: {
          line1: validatedData.shippingAddress.line1,
          line2: validatedData.shippingAddress.line2,
          city: validatedData.shippingAddress.city,
          state: validatedData.shippingAddress.state,
          postal_code: validatedData.shippingAddress.postal_code,
          country: validatedData.shippingAddress.country,
        },
      },

      // Use automatic payment methods (recommended for mobile)
      automatic_payment_methods: {
        enabled: true,
      },

      // Capture method (capture immediately when confirmed)
      capture_method: "automatic",
    });

    // Update the pending order with the paymentIntentId
    newOrder.paymentIntentId = paymentIntent.id;
    await newOrder.save();
    console.log("✅ Order updated with Payment Intent ID:", paymentIntent.id);

    console.log("✅ Payment Intent created:", paymentIntent.id);

    // Prepare response for mobile app
    const response = {
      success: true,
      orderId: newOrder._id.toString(), // Return the order ID
      orderNumber: newOrder.orderNumber, // Return the order number
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      customer: {
        id: stripeCustomer.id,
        email: stripeCustomer.email,
      },
      orderSummary: {
        subtotal: validatedData.subtotal,
        taxAmount: validatedData.taxAmount,
        shippingAmount: validatedData.shippingAmount,
        discountAmount: validatedData.discountAmount,
        totalAmount: validatedData.totalAmount,
        currency: validatedData.currency,
        items: validatedData.items,
        appliedPromotion: validatedData.appliedPromotion,
        membershipInfo: validatedData.membershipInfo,
      },
    };

    console.log("📤 Payment Intent response sent successfully");
    console.log("💳 Client secret provided for mobile confirmation");

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Create payment intent error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid checkout data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Payment processing error",
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
