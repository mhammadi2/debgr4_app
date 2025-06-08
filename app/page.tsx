"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Cpu, Zap, Globe, ArrowRight, Check, BookOpen } from "lucide-react";
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
      setCarouselProducts(products.slice(0, 5));
    }
  }, [products]);

  const serviceCards = [
    {
      icon: Cpu,
      title: "Custom IC Design",
      description:
        "Tailored semiconductor solutions that push the boundaries of performance and efficiency.",
      link: "/design-service",
    },
    {
      icon: Zap,
      title: "High-Performance SoCs",
      description:
        "Advanced System-on-Chip designs optimized for AI, IoT, and emerging technologies.",
      link: "/products",
    },
    {
      icon: Globe,
      title: "Global Innovation",
      description:
        "Cutting-edge semiconductor solutions that power next-generation global technologies.",
      link: "/about",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 text-gray-800">
          IC and Electronic Product Excellence
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
          Pioneering advanced integrated circuit designs that transform
          technological possibilities across IoT, AI, industrial automation, and
          beyond.
        </p>

        <div className="flex justify-center space-x-6">
          <Link
            href="/design-service"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Design Services <ArrowRight className="ml-2" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Contact Our Team <Check className="ml-2" />
          </Link>
        </div>
      </motion.section>

      {/* Product Carousel */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        {error ? (
          <div className="text-center p-4 bg-red-100 rounded">
            Error loading products. Please try again later.
          </div>
        ) : !products ? (
          <div className="text-center p-4">Loading products...</div>
        ) : (
          <Carousel products={carouselProducts} />
        )}
      </motion.section>

      {/* Services Overview */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Core Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {serviceCards.map((card, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
            >
              <CardHeader className="flex items-center">
                <card.icon className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{card.description}</p>
                <Link
                  href={card.link}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Learn More <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Knowledge Base Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-50 p-12 rounded-lg text-center"
      >
        <h2 className="text-3xl font-bold mb-6">Explore Our Knowledge Base</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Dive deep into semiconductor design, emerging technologies, and
          innovative solutions through our comprehensive resources.
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="/resources"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="mr-2" /> View Resources
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}

// Optional: Diagnostic Component (can be added conditionally)
function DiagnosticTool() {
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diagnose");
      const data = await response.json();
      setDiagnostic(data);
    } catch (error) {
      console.error("Diagnostic error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">System Diagnostic Tool</h3>
      <Button onClick={runDiagnostic} disabled={loading} variant="outline">
        {loading ? "Running Diagnosis..." : "Run System Check"}
      </Button>

      {diagnostic && (
        <pre className="mt-4 p-3 bg-gray-100 text-xs overflow-auto">
          {JSON.stringify(diagnostic, null, 2)}
        </pre>
      )}
    </div>
  );
}
