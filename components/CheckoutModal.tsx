// components/CheckoutModal.tsx
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalAmount,
}) => {
  const [email, setEmail] = useState("");

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          cart,
          totalAmount,
        }),
      });

      const { sessionUrl } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <div className="mb-4">
          <h3 className="font-bold">Order Summary</h3>
          {cart.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={!email}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
