"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { ShoppingCart } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import CheckoutModal from "@/components/CheckoutModal";

// ✅ FIXED: Complete Product interface matching CartContext
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number; // ✅ FIXED: Make required, not optional
  createdAt?: string; // ✅ ADDED: Optional for API response
  updatedAt?: string; // ✅ ADDED: Optional for API response
}

// Placeholder image constant
const PLACEHOLDER_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==`;

export default function ProductsPage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // ✅ FIXED: Get cart functions from context
  const { addToCart, cart, getTotalPrice, isHydrated } = useCart();

  // Function to resolve image path
  const resolveImagePath = (imagePath?: string): string => {
    if (!imagePath) return PLACEHOLDER_IMAGE;

    // Handle both absolute and relative paths
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Ensure no double slashes and clean up path
    return `/${imagePath.replace(/^\/+/, "")}`;
  };

  // Function to format price safely
  const formatPrice = (price: string | number): string => {
    // Ensure price is a number
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;

    // Check if conversion resulted in a valid number
    if (isNaN(numericPrice)) {
      return "0.00"; // Fallback for invalid values
    }

    return numericPrice.toFixed(2);
  };

  // ✅ FIXED: Enhanced fetch with better error handling
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch products: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Raw API response:", data); // ✅ DEBUG LOG

        // ✅ FIXED: Validate and process each product
        const processedData = data.map((product: any, index: number) => {
          // ✅ FIXED: Validate each product
          if (!product.id) {
            console.error(`Product at index ${index} missing ID:`, product);
          }
          if (!product.name) {
            console.error(`Product at index ${index} missing name:`, product);
          }
          if (product.price === undefined || product.price === null) {
            console.error(`Product at index ${index} missing price:`, product);
          }

          return {
            ...product,
            // Ensure required fields have defaults
            id: product.id || 0,
            name: product.name || "Unknown Product",
            category: product.category || "Unknown",
            description: product.description || "",
            price:
              typeof product.price === "string"
                ? parseFloat(product.price)
                : product.price || 0,
            imageUrl: product.imageUrl || "",
            stock: product.stock || 0,
            createdAt: product.createdAt || new Date().toISOString(),
            updatedAt: product.updatedAt || new Date().toISOString(),
          };
        });

        console.log("Processed products:", processedData); // ✅ DEBUG LOG
        setProducts(processedData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ FIXED: Handle adding product to cart with proper Product interface
  const handleAddToCart = (product: Product) => {
    try {
      // ✅ FIXED: Validate product data first
      if (!product) {
        toast.error("Invalid product");
        return;
      }

      if (!product.id || product.id === null || product.id === undefined) {
        toast.error("Product ID is missing");
        console.error("Product missing ID:", product);
        return;
      }

      if (!product.name) {
        toast.error("Product name is missing");
        return;
      }

      if (
        product.price === undefined ||
        product.price === null ||
        isNaN(product.price)
      ) {
        toast.error("Product price is invalid");
        return;
      }

      if (product.stock !== undefined && product.stock <= 0) {
        toast.error("This product is out of stock");
        return;
      }

      // ✅ FIXED: Create proper Product object (not CartItem)
      const productForCart: Product = {
        id: product.id,
        name: product.name,
        category: product.category || "Unknown",
        description: product.description || "",
        price:
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price,
        imageUrl: product.imageUrl || "",
        stock: product.stock || 0,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      };

      console.log("Adding product to cart:", productForCart); // ✅ DEBUG LOG

      // ✅ FIXED: Pass Product object to addToCart (not CartItem)
      addToCart(productForCart, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Could not add item to cart");
    }
  };

  // Toggle cart sidebar
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // ✅ FIXED: Handle checkout with proper error handling
  const handleCheckout = () => {
    if (!isHydrated) {
      toast.error("Please wait, loading cart...");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const totalPrice = getTotalPrice();
    if (totalPrice <= 0) {
      toast.error("Invalid cart total");
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Loading and Error states
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-4 border-t-green-500 border-gray-200 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Cart Toggle Button */}
      <button
        onClick={toggleCart}
        className="fixed top-20 right-4 z-[60] bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center"
      >
        <ShoppingCart size={20} />
        {isHydrated && cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>

      {/* ✅ FIXED: CartSidebar with proper props */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* ✅ FIXED: CheckoutModal with proper conditional rendering */}
      {isCheckoutOpen && isHydrated && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          totalAmount={getTotalPrice()}
        />
      )}

      {/* Toaster for notifications */}
      <Toaster position="top-right" />

      {/* Products Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="flex flex-col h-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex-grow"
                >
                  <Card className="overflow-hidden shadow-lg h-full flex flex-col">
                    <div className="relative w-full h-48">
                      <Image
                        src={resolveImagePath(product.imageUrl)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-110"
                        placeholder="blur"
                        blurDataURL={PLACEHOLDER_IMAGE}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span>{" "}
                          {product.category}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mt-2">
                          <span className="text-lg font-bold text-green-600">
                            ${formatPrice(product.price)}
                          </span>
                        </div>
                        {product.stock !== undefined && (
                          <p
                            className={`text-xs ${
                              product.stock <= 5
                                ? "text-amber-600"
                                : "text-gray-500"
                            }`}
                          >
                            {product.stock > 0
                              ? `In Stock: ${product.stock}`
                              : "Out of Stock"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <div className="mt-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2 rounded-md text-sm transition flex items-center justify-center ${
                      product.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-10">
              No products available at the moment.
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
