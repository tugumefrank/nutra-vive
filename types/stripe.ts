// types/stripe.ts
import Stripe from "stripe";

/**
 * Extended Stripe types following t3dotgg guide
 * Keep types simple and focused on what we actually use
 */

export interface StripeCustomerData {
  customerId: string;
  subscription?: {
    id: string;
    status: Stripe.Subscription.Status;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
    priceId: string;
    membershipId?: string;
  };
  paymentMethod?: {
    id: string;
    type: string;
    last4?: string;
    brand?: string;
  };
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface MembershipCheckoutData {
  membershipId: string;
  membershipName: string;
  membershipTier: string;
  price: number;
  billingFrequency: string;
}

export interface SubscriptionEventData {
  subscriptionId: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  membershipId?: string;
  userId?: string;
}

export interface InvoiceEventData {
  invoiceId: string;
  subscriptionId?: string;
  customerId: string;
  amountPaid: number;
  status: string;
}

// Webhook event types we care about
export type StripeWebhookEventType = 
  | 'customer.subscription.created'
  | 'customer.subscription.updated' 
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'checkout.session.completed'
  | 'payment_intent.succeeded';

// Simplified action results
export interface StripeActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Membership subscription status mapping
export type MembershipStatus = 
  | 'active'
  | 'cancelled' 
  | 'paused'
  | 'incomplete'
  | 'inactive';

export function mapStripeStatusToMembershipStatus(
  stripeStatus: Stripe.Subscription.Status
): MembershipStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "paused";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
    case "unpaid":
      return "incomplete";
    default:
      return "inactive";
  }
}