"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variantId?: string;
  variantName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantityToAdd?: number,
    variantId?: string,
    variantName?: string
  ) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (cartItemId: string) => number;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getUniqueItems: () => number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage only after hydration
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [cart, isHydrated]);

  const addToCart = useCallback(
    (
      product: Product,
      quantityToAdd: number = 1,
      variantId?: string,
      variantName?: string
    ) => {
      // ✅ FIXED: Add comprehensive validation
      if (!product) {
        console.error("Product is undefined");
        return;
      }

      if (product.id === undefined || product.id === null) {
        console.error("Product ID is undefined or null:", product);
        return;
      }

      if (!product.name) {
        console.error("Product name is undefined:", product);
        return;
      }

      if (
        product.price === undefined ||
        product.price === null ||
        isNaN(product.price)
      ) {
        console.error("Product price is invalid:", product);
        return;
      }

      console.log("Adding product to cart:", product); // ✅ DEBUG LOG

      setCart((prevCart) => {
        const cartItemId = variantId
          ? `${product.id}_${variantId}`
          : `${product.id}_base`;

        const existingItemIndex = prevCart.findIndex(
          (item) => item.id === cartItemId
        );

        const maxStock = product.stock || 999; // ✅ FIXED: Default stock
        const validQuantityToAdd = Math.max(1, quantityToAdd);

        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart];
          const existingItem = updatedCart[existingItemIndex];
          existingItem.quantity = Math.min(
            existingItem.quantity + validQuantityToAdd,
            maxStock
          );
          return updatedCart;
        } else {
          const initialQuantity = Math.min(validQuantityToAdd, maxStock);

          if (initialQuantity <= 0) {
            console.warn(
              `Attempted to add product ${product.name} (ID: ${product.id}) with 0 or less effective quantity after clamping for stock.`
            );
            return prevCart;
          }

          return [
            ...prevCart,
            {
              id: cartItemId,
              productId: product.id.toString(), // ✅ SAFE: Now validated above
              name: product.name,
              price: product.price,
              quantity: initialQuantity,
              imageUrl: product.imageUrl || "",
              variantId: variantId,
              variantName: variantName,
            },
          ];
        }
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (cartItemId: string, newQuantity: number) => {
      setCart((prevCart) =>
        prevCart
          .map((item) => {
            if (item.id === cartItemId) {
              const clampedQuantity = Math.max(1, newQuantity);
              return {
                ...item,
                quantity: clampedQuantity,
              };
            }
            return item;
          })
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getItemQuantity = useCallback(
    (cartItemId: string) => {
      const item = cart.find((item) => item.id === cartItemId);
      return item?.quantity || 0;
    },
    [cart]
  );

  const getTotalItems = useCallback(() => {
    if (!isHydrated) return 0;
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart, isHydrated]);

  const getUniqueItems = useCallback(() => {
    if (!isHydrated) return 0;
    return cart.length;
  }, [cart, isHydrated]);

  const getTotalPrice = useCallback(() => {
    if (!isHydrated) return 0;
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart, isHydrated]);

  const contextValue = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    getTotalPrice,
    getTotalItems,
    getUniqueItems,
    isHydrated,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
