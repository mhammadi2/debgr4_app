// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { ShoppingCart } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Placeholder image constant
const PLACEHOLDER_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==`;

// Product interface definition
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock?: number;
}

export default function ProductsPage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Use cart context
  const { addToCart, getItemQuantity } = useCart();

  // Function to resolve image path
  const resolveImagePath = (imagePath?: string): string => {
    return imagePath ? `/${imagePath.replace(/^\/+/, "")}` : PLACEHOLDER_IMAGE;
  };

  // Fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    try {
      // Check if stock is available
      if (product.stock !== undefined && product.stock <= 0) {
        toast.error("This product is out of stock");
        return;
      }

      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
      });

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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
          className="w-12 h-12 border-4 border-t-4 border-t-green-500 border-gray-200 rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Cart Toggle Button */}
      <button
        onClick={toggleCart}
        className="fixed top-20 right-4 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center"
      >
        <ShoppingCart size={20} />
        <span className="ml-2">Cart</span>
      </button>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      {/* Products Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col h-full">
              {/* Product Card with Image (animated) */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex-grow"
              >
                <Card className="overflow-hidden shadow-lg h-full flex flex-col">
                  {/* Product Image */}
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

                  {/* Product Details */}
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      {/* Category */}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span>{" "}
                        {product.category}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="mt-2">
                        <span className="text-lg font-bold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Stock Information */}
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

              {/* Add to Cart Button (separate, not animated) */}
              <div className="mt-3">
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`
                    w-full py-2 rounded-md text-sm transition 
                    flex items-center justify-center
                    ${
                      product.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }
                  `}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No products available at the moment.
          </div>
        )}
      </motion.section>
    </div>
  );
}
