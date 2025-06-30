type CreatePaymentIntentFunction = (amount: number) => Promise<string>;

export const createPaymentIntent: CreatePaymentIntentFunction = async (
  amount
) => {
  const calculateStripeAmount = (amount: number): number => {
    return Math.round(amount * 100);
  };
  try {
    const response = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: calculateStripeAmount(amount),
        currency: "usd",
      }),
    });
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to initialize payment. Please try again.");
  }
};
