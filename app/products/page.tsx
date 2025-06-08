"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Base64 placeholder image to avoid network requests
const PLACEHOLDER_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==`;

// Product interface definition
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string; // Optional image URL
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to resolve image path based on provided logic
  const resolveImagePath = (imagePath?: string): string => {
    return imagePath ? `/${imagePath.replace(/^\/+/, "")}` : PLACEHOLDER_IMAGE; // Fallback to placeholder image
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
  }, []); // The empty array ensures this runs only once

  // Loading spinner
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

  // Error message
  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  // Render products
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <div className="relative w-full h-48">
                <Image
                  src={resolveImagePath(product.imageUrl)} // Use new image path logic
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  placeholder="blur"
                  blurDataURL={PLACEHOLDER_IMAGE} // Using the Base64 placeholder if needed
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      PLACEHOLDER_IMAGE; // Fallback on error
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {product.category}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No products available at the moment.
        </div>
      )}
    </motion.section>
  );
}
