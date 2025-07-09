"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartIconProps {
  onCartClick?: () => void;
  className?: string;
  size?: number;
  showBadge?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({
  onCartClick,
  className = "",
  size = 24,
  showBadge = true,
}) => {
  const { cart, getTotalItems } = useCart();

  // ✅ FIXED: Prevent hydration mismatch by using client-side only state
  const [isClient, setIsClient] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // ✅ FIXED: Only run on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ FIXED: Update total items only on client side
  useEffect(() => {
    if (isClient) {
      const total = getTotalItems();
      setTotalItems(total);
    }
  }, [isClient, cart, getTotalItems]);

  return (
    <button
      onClick={onCartClick}
      className={`relative p-2 text-gray-600 hover:text-green-600 transition-colors ${className}`}
      aria-label={
        isClient ? `Shopping cart with ${totalItems} items` : "Shopping cart"
      }
    >
      <ShoppingCart size={size} />

      {/* ✅ FIXED: Only show badge on client side after hydration */}
      {isClient && showBadge && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold min-w-[20px] animate-pulse">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </button>
  );
};
