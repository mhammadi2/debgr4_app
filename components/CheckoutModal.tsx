// components/CheckoutModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { X, CreditCard, Truck, Mail } from "lucide-react";
import { CartItem, useCart } from "@/contexts/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-hot-toast";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Form data types
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalAmount,
}) => {
  // Multi-step form handling
  const [step, setStep] = useState<"delivery" | "payment" | "confirmation">(
    "delivery"
  );
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryFormData | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState<{
    orderId: string;
    estimatedDelivery: string;
  } | null>(null);

  const { clearCart } = useCart();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormData>();

  // Handle delivery form submission
  const onDeliverySubmit = async (data: DeliveryFormData) => {
    setIsProcessing(true);
    try {
      // Save delivery information
      setDeliveryInfo(data);

      // Move to payment step
      setStep("payment");
    } catch (error) {
      console.error("Error saving delivery information:", error);
      toast.error("Could not save delivery information");
    } finally {
      setIsProcessing(false);
    }
  };

  // For demo purposes - simulate successful payment
  const simulateSuccessfulPayment = (orderId: string) => {
    // Calculate estimated delivery (5-7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(
      deliveryDate.getDate() + 5 + Math.floor(Math.random() * 3)
    );

    setConfirmationDetails({
      orderId:
        orderId ||
        `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      estimatedDelivery: deliveryDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });

    // Send confirmation email
    sendConfirmationEmail();

    // Move to confirmation step
    setStep("confirmation");
    setIsProcessing(false);

    // Clear cart
    clearCart();
  };

  // Handle payment with Stripe
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (!deliveryInfo) throw new Error("Delivery information missing");

      // Create a checkout session on the server
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          deliveryInfo,
        }),
      });

      if (!response.ok) throw new Error("Payment session creation failed");

      const { sessionId, orderId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

      // Note: In a real implementation, the confirmation would happen after Stripe redirect
      // For demo purposes, we'll simulate success
      simulateSuccessfulPayment(orderId);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Send confirmation email
  const sendConfirmationEmail = async () => {
    if (!deliveryInfo) return;

    try {
      const response = await fetch("/api/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: deliveryInfo.email,
          name: deliveryInfo.fullName,
          orderDetails: {
            items: cart,
            totalAmount,
            deliveryAddress: deliveryInfo.address,
            orderId: confirmationDetails?.orderId || "Processing",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send confirmation email");

      toast.success("Order confirmation email sent");
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Could not send confirmation email");
    }
  };

  // Close the modal and reset state
  const handleClose = () => {
    if (step === "confirmation") {
      // Reset all states if closing after confirmation
      setStep("delivery");
      setDeliveryInfo(null);
      setConfirmationDetails(null);
    }
    onClose();
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden"
        >
          {/* Header with Step Indicator */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {step === "delivery" && "Delivery Information"}
              {step === "payment" && "Payment Details"}
              {step === "confirmation" && "Order Confirmation"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{
                width:
                  step === "delivery"
                    ? "33%"
                    : step === "payment"
                    ? "66%"
                    : "100%",
              }}
            />
          </div>

          {/* Content Based on Current Step */}
          <div className="p-6">
            {/* Step 1: Delivery Information */}
            {step === "delivery" && (
              <form onSubmit={handleSubmit(onDeliverySubmit)}>
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        {...register("fullName", {
                          required: "Full name is required",
                        })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email*
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Invalid email format",
                          },
                        })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                      })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Address Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address*
                    </label>
                    <input
                      type="text"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City*
                      </label>
                      <input
                        type="text"
                        {...register("city", { required: "City is required" })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province*
                      </label>
                      <input
                        type="text"
                        {...register("state", {
                          required: "State is required",
                        })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code*
                      </label>
                      <input
                        type="text"
                        {...register("zipCode", {
                          required: "ZIP code is required",
                        })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country*
                      </label>
                      <input
                        type="text"
                        {...register("country", {
                          required: "Country is required",
                        })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        defaultValue="United States"
                      />
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      {...register("specialInstructions")}
                      rows={3}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Truck size={18} className="mr-2" />
                        Continue to Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Details */}
            {step === "payment" && deliveryInfo && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Order Summary
                  </h3>
                  <div className="space-y-2 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Details Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">Shipping To</h3>
                    <button
                      onClick={() => setStep("delivery")}
                      className="text-sm text-green-500 hover:text-green-600"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm">{deliveryInfo.fullName}</p>
                  <p className="text-sm">{deliveryInfo.address}</p>
                  <p className="text-sm">
                    {deliveryInfo.city}, {deliveryInfo.state}{" "}
                    {deliveryInfo.zipCode}
                  </p>
                  <p className="text-sm">{deliveryInfo.country}</p>
                </div>

                {/* Payment Button */}
                <div>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      "Processing Payment..."
                    ) : (
                      <>
                        <CreditCard size={18} className="mr-2" />
                        Pay ${totalAmount.toFixed(2)}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center mt-2 text-gray-500">
                    Your payment will be processed securely via Stripe
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {step === "confirmation" && confirmationDetails && (
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-4">
                    <svg
                      className="h-12 w-12 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Order Successfully Placed!
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Thank you for your purchase. We've sent a confirmation to
                    your email.
                  </p>
                </div>

                {/* Order Details */}
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <p className="font-medium">
                    Order ID: {confirmationDetails.orderId}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated Delivery: {confirmationDetails.estimatedDelivery}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleClose}
                    className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
