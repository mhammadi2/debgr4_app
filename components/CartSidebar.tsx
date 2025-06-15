// components/CartSidebar.tsx
"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal"; // Ensure you have this component

export const CartSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Calculate total amount
  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Sidebar animation variants
  const sidebarVariants = {
    hidden: {
      x: "100%",
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
    visible: {
      x: 0,
      transition: {
        type: "tween",
        duration: 0.3,
      },
    },
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
            className="w-96 bg-white h-full shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside sidebar
          >
            {/* Cart Header */}
            <div className="flex justify-between items-center p-4 border-b">
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
                <Image
                  src="/empty-cart.svg" // Add an empty cart SVG
                  alt="Empty Cart"
                  width={200}
                  height={200}
                />
                <p className="mt-4 text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-4 border-b pb-4"
                    >
                      {/* Product Image */}
                      <Image
                        src={item.imageUrl || "/placeholder-product.png"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />

                      {/* Product Details */}
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-500">
                          ${item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="bg-gray-200 px-2 rounded"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="bg-gray-200 px-2 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Item */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="p-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">${totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsCheckoutModalOpen(true)}
                      className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Checkout Modal */}
          {cart.length > 0 && (
            <CheckoutModal
              isOpen={isCheckoutModalOpen}
              onClose={() => setIsCheckoutModalOpen(false)}
              cart={cart}
              totalAmount={totalAmount}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
