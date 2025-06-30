// components/CartSidebar.tsx (Revised)
"use client";

import { useCart, CartItem } from "@/contexts/CartContext"; // Import CartItem type
import Image from "next/image";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// REMOVED: No longer needs its own state or the CheckoutModal component
// import { useState } from "react";
// import CheckoutModal from "./CheckoutModal";

// --- CHANGE 1: Updated props ---
// It now receives an `onCheckout` function to notify the parent.
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar = ({
  isOpen,
  onClose,
  onCheckout, // Use the new prop
}: CartSidebarProps) => {
  // --- CHANGE 2: Removed local state for the modal ---
  // const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // No changes needed here, context usage is correct
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } =
    useCart();

  // Use the function from the context directly
  const totalAmount = getTotalPrice();

  // No changes to animations
  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={onClose}
        >
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full max-w-md bg-white h-full shadow-xl flex flex-col" // Added flex flex-col
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="text-green-600" />
                <h2 className="text-xl font-bold">Your Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <p className="mt-4 text-gray-500">Your cart is empty.</p>
              </div>
            ) : (
              // Added flex-grow to make this section scrollable and fill available space
              <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                {cart.map(
                  (
                    item: CartItem // Explicitly type item as CartItem
                  ) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <Image
                        src={item.imageUrl || "/placeholder-product.png"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover border"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-500 text-sm">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            // --- CHANGE 3: Use item.id ---
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="bg-gray-200 w-6 h-6 rounded text-lg flex items-center justify-center"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            // --- CHANGE 3: Use item.id ---
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="bg-gray-200 w-6 h-6 rounded text-lg flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        // --- CHANGE 3: Use item.id ---
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Cart Summary & Actions */}
            {cart.length > 0 && (
              <div className="p-4 border-t shrink-0">
                <div className="flex justify-between mb-4 font-bold text-lg">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <button
                    // --- CHANGE 4: Call onCheckout prop ---
                    onClick={onCheckout}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}

            {/* --- CHANGE 5: Removed CheckoutModal from here --- */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
