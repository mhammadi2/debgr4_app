// contexts/CartContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem, variant?: ProductVariant) => void;
  removeFromCart: (productId: number, variantId?: string) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, variantId?: string) => number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getItemQuantity: () => 0,
});

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: CartItem, variant?: ProductVariant) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.productId === product.productId &&
          (!variant || item.selectedVariant?.id === variant.id)
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        const maxStock = variant?.stock || Infinity;
        updatedCart[existingItemIndex].quantity = Math.min(
          updatedCart[existingItemIndex].quantity + 1,
          maxStock
        );
        return updatedCart;
      }

      // Add new item to cart
      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          selectedVariant: variant,
          variants: product.variants,
        },
      ];
    });
  };

  const removeFromCart = (productId: number, variantId?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          item.productId !== productId ||
          (variantId && item.selectedVariant?.id !== variantId)
      )
    );
  };

  const updateQuantity = (
    productId: number,
    quantity: number,
    variantId?: string
  ) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (
          item.productId === productId &&
          (!variantId || item.selectedVariant?.id === variantId)
        ) {
          // Validate against stock if variant exists
          const maxStock = item.selectedVariant?.stock || Infinity;
          return {
            ...item,
            quantity: Math.min(Math.max(quantity, 1), maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQuantity = (productId: number, variantId?: string) => {
    const item = cart.find(
      (item) =>
        item.productId === productId &&
        (!variantId || item.selectedVariant?.id === variantId)
    );
    return item?.quantity || 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
