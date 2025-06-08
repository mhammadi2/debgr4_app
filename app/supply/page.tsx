"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Microchip,
  CircuitBoard,
  Warehouse,
  Truck,
  Globe,
} from "lucide-react";

// Define interface for supply categories
interface SupplyCategory {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

export default function SupplyPage() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Supply categories with detailed information
  const supplyCategories: SupplyCategory[] = [
    {
      id: 1,
      title: "Electronic Components",
      description:
        "We specialize in a comprehensive range of electronic components, including:\n" +
        "- Microcontrollers (MCUs)\n" +
        "- Integrated Circuits (ICs)\n" +
        "- Resistors, Capacitors, Inductors\n" +
        "- Semiconductor devices\n" +
        "- Sensors and actuators\n" +
        "- Discrete semiconductors",
      icon: Microchip,
    },
    {
      id: 2,
      title: "Modular Systems",
      description:
        "Our modular systems solutions include:\n" +
        "- Embedded computing modules\n" +
        "- IoT development kits\n" +
        "- Communication modules\n" +
        "- Power management systems\n" +
        "- Custom integration solutions\n" +
        "- Prototype and production-ready modules",
      icon: CircuitBoard,
    },
    // {
    //   id: 3,
    //   title: "Supply Chain Management",
    //   description:
    //     "Comprehensive supply chain services:\n" +
    //     "- Global sourcing network\n" +
    //     "- Just-in-time (JIT) inventory management\n" +
    //     "- Quality assurance and testing\n" +
    //     "- Vendor qualification\n" +
    //     "- Risk mitigation strategies\n" +
    //     "- Sustainable procurement practices",
    //   icon: Warehouse,
    // },
    // {
    //   id: 4,
    //   title: "Logistics & Distribution",
    //   description:
    //     "Efficient logistics solutions:\n" +
    //     "- Worldwide shipping\n" +
    //     "- Climate-controlled transportation\n" +
    //     "- Expedited and standard shipping options\n" +
    //     "- Real-time tracking\n" +
    //     "- Customs clearance support\n" +
    //     "- Specialized handling for sensitive electronics",
    //   icon: Truck,
    // },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Supply Components and Module
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Delivering cutting-edge electronic components, modular systems, and
          comprehensive supply chain solutions to innovators and manufacturers
          worldwide.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {supplyCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            className={`  
              border rounded-lg p-6 shadow-md cursor-pointer transition-all  
              ${
                activeCategory === category.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white hover:bg-gray-50"
              }  
            `}
            onClick={() =>
              setActiveCategory(
                activeCategory === category.id ? null : category.id
              )
            }
          >
            <div className="flex items-center mb-4">
              <category.icon className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-xl font-semibold">{category.title}</h2>
            </div>
            {activeCategory === category.id && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="text-gray-600 whitespace-pre-line"
              >
                {category.description}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gray-100 p-8 rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
        <p className="text-gray-700">
          We are dedicated to providing high-quality electronic components,
          innovative modular systems, and reliable supply chain solutions. Our
          global network, strategic partnerships, and rigorous quality control
          ensure that we meet the evolving needs of technology innovators across
          various industries.
        </p>
      </motion.div>
    </motion.section>
  );
}
