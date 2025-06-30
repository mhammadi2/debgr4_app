// app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use a fixed API version
});

// Initialize Prisma Client
const prisma = new PrismaClient();

// --- Define the expected data structures from the frontend ---

// This matches the CartItem type in your CartContext
interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// This matches the DeliveryFormData in your CheckoutModal
interface DeliveryFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  specialInstructions?: string;
}

// This is the structure of the incoming request body
interface CheckoutRequestBody {
  cart: CartItem[];
  deliveryInfo: DeliveryFormData;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { cart, deliveryInfo } = body;

    // --- Basic Validation ---
    if (!cart || cart.length === 0 || !deliveryInfo || !deliveryInfo.email) {
      return NextResponse.json(
        { error: "Missing required cart or delivery information." },
        { status: 400 }
      );
    }

    // --- FIX: Dynamically get the site's origin URL ---
    // This creates a full URL (e.g., "https://your-site.com" or "http://localhost:3000")
    // and prevents the "Invalid URL" error from Stripe.
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // --- Create a Stripe Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // Stripe line items are created from the cart data
      line_items: cart.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            // You can optionally pass images to Stripe's checkout page
            images: item.imageUrl ? [`${origin}${item.imageUrl}`] : undefined,
          },
          // Price must be in the smallest currency unit (e.g., cents for USD)
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      // --- Use the dynamically generated origin for redirect URLs ---
      // Best practice: include the session_id to fetch order details on the success page
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products`, // Redirect back to products if the user cancels
      customer_email: deliveryInfo.email,
      // Metadata is useful for storing non-sensitive order context
      metadata: {
        customerName: deliveryInfo.fullName,
        customerPhone: deliveryInfo.phone,
      },
    });

    if (!session.id) {
      throw new Error("Stripe session creation failed.");
    }

    // --- Create a PENDING order in your database ---
    // It's recommended to use a webhook to confirm the order *after* payment succeeds,
    // but creating a pending order here is a common and acceptable pattern.
    await prisma.order.create({
      data: {
        email: deliveryInfo.email,
        // SECURITY: Recalculate total amount on the server, not from the client
        totalAmount: cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        status: "PENDING", // Status will be updated to 'COMPLETED' by a webhook
        stripePaymentIntentId: session.id, // Use the session ID
        // Store the delivery address details with the order
        deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} ${deliveryInfo.zipCode}, ${deliveryInfo.country}`,
        customerName: deliveryInfo.fullName,
        customerPhone: deliveryInfo.phone,
        items: {
          create: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // --- Return the session URL to the frontend ---
    // The frontend will use this URL to redirect the user to Stripe's checkout page.
    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: any) {
    // Enhanced error logging for easier debugging
    console.error("CREATE-CHECKOUT-SESSION-ERROR:", err);
    const errorMessage =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      { error: "Failed to create checkout session.", details: errorMessage },
      { status: 500 }
    );
  }
}
