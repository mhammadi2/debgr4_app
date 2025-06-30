// lib/stripe.ts
import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export async function getStripe() {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing");
      return null;
    }
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}
