// contexts/CartContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

// --- Type Definitions based on your Prisma Schema ---

// Product interface directly reflects your Prisma Product model
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number; // base price
  imageUrl?: string;
  stock: number; // Global stock for this product (assuming no per-variant stock tracking in Prisma Product)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Note: No 'variants' array here, as per your Prisma Product model
}

// Represents an item stored in the shopping cart
export interface CartItem {
  id: string; // Unique ID for this specific cart item (e.g., "productId_variantId" or "productId_base")
  productId: number; // The ID of the base product
  name: string; // The name of the product (denormalized for snapshot)
  price: number; // The effective price of *this specific* cart item (base product price as per schema)
  quantity: number;
  imageUrl?: string;
  // If your frontend allows variant selection for a product that doesn't have distinct Product entries per variant,
  // these fields would store the selected variant details for the OrderItem.
  // The stock check would still be against the Product.stock.
  variantId?: string; // Optional: ID for the selected variant (e.g., 'red', 'size-m')
  variantName?: string; // Optional: Name for the selected variant (e.g., 'Red', 'Size Medium')
  // Note: No 'selectedVariant' object, as Prisma schema doesn't model ProductVariants explicitly.
}

// --- Cart Context Type ---
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
}

// --- Create Cart Context ---
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Cart Provider Component ---
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage on component mount
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        return []; // Return empty cart on parsing error
      }
    }
    return []; // For SSR or initial render where window is not defined
  });

  // Effect to save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [cart]);

  // --- Cart Actions ---
  const addToCart = useCallback(
    (
      product: Product,
      quantityToAdd: number = 1,
      variantId?: string,
      variantName?: string
    ) => {
      setCart((prevCart) => {
        // Generate a unique ID for the cart item based on product and optional variant
        const cartItemId = variantId
          ? `${product.id}_${variantId}`
          : `${product.id}_base`;

        const existingItemIndex = prevCart.findIndex(
          (item) => item.id === cartItemId
        );

        // Max stock is now directly from Product.stock
        const maxStock = product.stock;

        // Ensure quantityToAdd is positive
        const validQuantityToAdd = Math.max(1, quantityToAdd);

        if (existingItemIndex > -1) {
          // Item already exists, update its quantity
          const updatedCart = [...prevCart];
          const existingItem = updatedCart[existingItemIndex];
          // Clamp the new quantity to not exceed available stock
          existingItem.quantity = Math.min(
            existingItem.quantity + validQuantityToAdd,
            maxStock
          );
          return updatedCart;
        } else {
          // Item does not exist, add it to the cart
          const initialQuantity = Math.min(validQuantityToAdd, maxStock);

          // Only add if initial quantity is valid (e.g., not 0 or less after clamping)
          if (initialQuantity <= 0) {
            console.warn(
              `Attempted to add product ${product.name} (ID: ${product.id}) with 0 or less effective quantity after clamping for stock.`
            );
            return prevCart; // Don't add to cart if quantity is 0 or less
          }

          return [
            ...prevCart,
            {
              id: cartItemId,
              productId: product.id,
              name: product.name,
              price: product.price, // Use product's base price as per schema
              quantity: initialQuantity,
              imageUrl: product.imageUrl,
              variantId: variantId, // Store variant ID if provided
              variantName: variantName, // Store variant Name if provided
            },
          ];
        }
      });
    },
    [] // Dependencies: empty array since `setCart` is stable.
  );

  const updateQuantity = useCallback(
    (cartItemId: string, newQuantity: number) => {
      setCart(
        (prevCart) =>
          prevCart
            .map((item) => {
              if (item.id === cartItemId) {
                // Find the product in the cart to get its original stock from the fetched products
                // NOTE: This assumes `product.stock` in the cart item is a snapshot.
                // For real-time stock, you'd re-fetch product details or manage a global product state.
                // For now, we'll assume the stock value stored when added to cart is sufficient for local checks.
                // If you need real-time stock, fetch it here or pass Product to CartItem.
                // Since `Product.stock` is updated in the DB, this check might not be fully accurate without re-fetching.
                // A more robust solution might pass the actual product (with its stock) to `updateQuantity`.
                // For simplicity, we assume `item.productStock` was captured (but it's not currently in `CartItem`).
                // We'll proceed by clamping to 1, and relying on backend stock checks.
                // Best practice: Re-fetch product stock or use a more comprehensive product cache.

                // As product.stock is not directly stored in CartItem, we can't directly check against it here
                // without finding the original Product first.
                // For now, we'll clamp to a minimum of 1. Actual stock check and deduction happens on checkout.
                const clampedQuantity = Math.max(1, newQuantity); // Ensure quantity is at least 1
                return {
                  ...item,
                  quantity: clampedQuantity,
                };
              }
              return item;
            })
            .filter((item) => item.quantity > 0) // Remove items if quantity drops to 0
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
    [cart] // Dependency: cart state
  );

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // --- Context Value ---
  const contextValue = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// --- Custom Hook to Use Cart Context ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
