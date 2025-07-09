"use client";

import { useCart, CartItem } from "@/contexts/CartContext";
import Image from "next/image";
import { X, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { toast } from "react-hot-toast";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar = ({
  isOpen,
  onClose,
  onCheckout,
}: CartSidebarProps) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isHydrated,
  } = useCart();

  // ✅ FIXED: Only calculate totals after hydration
  const totalAmount = isHydrated ? getTotalPrice() : 0;
  const totalItems = isHydrated ? getTotalItems() : 0;

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  // ✅ IMPROVED: Better quantity change handling with validation
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      toast.success("Item removed from cart");
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // ✅ IMPROVED: Handle remove with confirmation
  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    toast.success(`${itemName} removed from cart`);
  };

  // ✅ IMPROVED: Handle clear cart with confirmation
  const handleClearCart = () => {
    if (cart.length === 0) {
      toast.error("Cart is already empty");
      return;
    }

    clearCart();
    toast.success("Cart cleared");
  };

  // ✅ IMPROVED: Handle checkout with validation
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (totalAmount <= 0) {
      toast.error("Cart total must be greater than $0");
      return;
    }

    onCheckout();
  };

  // ✅ FIXED: Don't render cart content until hydrated
  if (!isHydrated) {
    return null;
  }

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
            className="w-full max-w-md bg-white h-full shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="text-green-600" />
                <h2 className="text-xl font-bold">
                  Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <ShoppingCart size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  Your cart is empty
                </p>
                <p className="text-gray-400 text-sm mt-2 text-center">
                  Add some items to get started
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                {cart.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden border shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder-product.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/placeholder-product.png";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        ${item.price.toFixed(2)} each
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-blue-600 font-medium">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-sm font-medium text-green-600">
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2 space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="bg-white border border-gray-300 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium text-sm bg-white border border-gray-300 py-1 px-2 rounded">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="bg-white border border-gray-300 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id, item.name)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors shrink-0"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Summary & Actions */}
            {cart.length > 0 && (
              <div className="p-4 border-t shrink-0 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items ({totalItems})</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>$10.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${(totalAmount + 10).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || totalAmount <= 0}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout (${(totalAmount + 10).toFixed(2)})
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
