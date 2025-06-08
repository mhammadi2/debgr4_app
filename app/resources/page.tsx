"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Book,
  Video,
  FileText,
  Download,
  Cpu,
  Zap,
  Globe,
  ArrowRight,
  Check,
} from "lucide-react";

// Define types for resources
interface ResourceItem {
  id: string;
  title: string;
  type: "Article" | "Video" | "Whitepaper" | "Tutorial";
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  link: string;
  tags: string[];
}

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const resourceCategories = [
    "All",
    "Fundamentals",
    "Design Techniques",
    "Advanced Topics",
    "Industry Insights",
  ];

  const resources: ResourceItem[] = [
    {
      id: "1",
      title: "Fundamentals of Analog IC Design",
      type: "Article",
      level: "Beginner",
      description:
        "Comprehensive introduction to analog integrated circuit design principles, covering basic concepts, circuit topologies, and design considerations.",
      link: "/resources/fundamentals-analog-ic",
      tags: ["Fundamentals", "Beginner"],
    },
    {
      id: "2",
      title: "Mixed-Signal Design: Bridging Analog and Digital Worlds",
      type: "Whitepaper",
      level: "Intermediate",
      description:
        "Deep dive into mixed-signal design techniques, interfacing analog and digital circuits, and key challenges in modern semiconductor design.",
      link: "/resources/mixed-signal-design",
      tags: ["Design Techniques", "Intermediate"],
    },
    {
      id: "3",
      title: "Advanced Analog Circuit Simulation Techniques",
      type: "Video",
      level: "Advanced",
      description:
        "Expert-led video tutorial on advanced simulation methodologies, including SPICE modeling, corner analysis, and Monte Carlo simulations.",
      link: "/resources/simulation-techniques",
      tags: ["Advanced Topics", "Simulation"],
    },
    {
      id: "4",
      title: "Low-Power Analog Circuit Design Strategies",
      type: "Article",
      level: "Intermediate",
      description:
        "Comprehensive guide to reducing power consumption in analog and mixed-signal integrated circuits, with practical design techniques and case studies.",
      link: "/resources/low-power-design",
      tags: ["Design Techniques", "Power Optimization"],
    },
    {
      id: "5",
      title: "Industry Trends in Analog IC Design",
      type: "Whitepaper",
      level: "Advanced",
      description:
        "Exploration of emerging trends, technologies, and market dynamics shaping the future of analog and mixed-signal integrated circuit design.",
      link: "/resources/industry-trends",
      tags: ["Industry Insights", "Trends"],
    },
  ];

  const filteredResources =
    selectedCategory && selectedCategory !== "All"
      ? resources.filter((resource) => resource.tags.includes(selectedCategory))
      : resources;

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
          Analog and Mixed-Signal IC Design Resources
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
          Comprehensive learning resources for semiconductor professionals,
          researchers, and enthusiasts exploring the intricate world of analog
          and mixed-signal integrated circuit design.
        </p>
      </motion.section>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {resourceCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {filteredResources.map((resource) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    resource.level === "Beginner"
                      ? "bg-green-100 text-green-800"
                      : resource.level === "Intermediate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {resource.level}
                </span>
                <div className="flex items-center">
                  {resource.type === "Article" && (
                    <Book className="w-5 h-5 text-blue-600" />
                  )}
                  {resource.type === "Video" && (
                    <Video className="w-5 h-5 text-red-600" />
                  )}
                  {resource.type === "Whitepaper" && (
                    <FileText className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <Link
                href={resource.link}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                Access Resource <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-50 p-12 rounded-lg text-center mt-16"
      >
        <h2 className="text-3xl font-bold mb-6">
          Enhance Your IC Design Knowledge
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Stay ahead in the rapidly evolving semiconductor industry with our
          comprehensive resources, expert insights, and cutting-edge research.
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="/contact"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="mr-2" /> Download Complete Guide
          </Link>
          <Link
            href="/design-service"
            className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Explore Design Services <Check className="ml-2" />
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}

// Optional: Add resource details page components
function ResourceDetailPage({ resource }: { resource: ResourceItem }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">{resource.title}</h1>
      {/* Add more detailed content based on resource type */}
    </div>
  );
}
