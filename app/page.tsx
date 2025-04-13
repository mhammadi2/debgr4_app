"use client";

import { motion } from "framer-motion";
import Carousel from "@/components/Carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: products, error } = useSWR<any[]>("/api/products", fetcher);
  const [carouselProducts, setCarouselProducts] = useState<any[]>([]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Take up to 5 products for the carousel
      setCarouselProducts(products.slice(0, 5));
    }
  }, [products]);

  return (
    <motion.section
      // fade in + slight upward motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Carousel at the top */}
      {error ? (
        <div className="text-center p-4 bg-red-100 rounded">
          Error loading products. Please try again later.
        </div>
      ) : !products ? (
        <div className="text-center p-4">Loading products...</div>
      ) : (
        <Carousel products={carouselProducts} />
      )}

      {/* Animated intro */}
      <div className="text-center mt-8">
        <h1 className="text-4xl font-bold">Welcome to ChipCo</h1>
        <p className="text-lg mt-2 max-w-2xl mx-auto">
          We specialize in cutting-edge integrated circuits and high-performance
          SoC solutions...
        </p>
      </div>

      {/* Cards for marketing sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ...same card code as before... */}
        <Card>
          <CardHeader>
            <CardTitle>Full-Custom IC Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              From concept to silicon, our full-custom IC design services...
            </p>
            <Button className="mt-4">Get Started</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Full-Custom IC Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              From concept to silicon, our full-custom IC design services...
            </p>
            <Button className="mt-4">Get Started</Button>
          </CardContent>
        </Card>
        {/* ...more cards... */}
      </div>
    </motion.section>
  );
}

// Diagnostic component to add to your page.tsx
function ImageDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diagnose");
      const data = await response.json();
      setDiagnostic(data);
      console.log("Diagnostic data:", data);
    } catch (error) {
      console.error("Diagnostic error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Image Diagnostic Tool</h3>
      <button
        onClick={runDiagnostic}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Running..." : "Check Image Files"}
      </button>

      {diagnostic && (
        <div className="mt-4">
          <h4 className="font-medium">Results:</h4>
          <pre className="mt-2 p-3 bg-gray-100 text-xs overflow-auto max-h-40">
            {JSON.stringify(diagnostic, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
