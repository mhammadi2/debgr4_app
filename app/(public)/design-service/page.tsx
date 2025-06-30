"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Layers, Zap, Codepen, Aperture, Target } from "lucide-react";

interface DesignService {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
}

export default function DesignServicePage() {
  const [activeService, setActiveService] = useState<number | null>(null);

  const designServices: DesignService[] = [
    {
      id: 1,
      title: "Full-Custom IC Design",
      description:
        "Tailored integrated circuit solutions from concept to production",
      icon: Cpu,
      details: [
        "End-to-end custom IC design",
        "Architecture optimization",
        "Performance-critical circuit development",
        "Advanced node technology implementation",
        "Complete design validation and verification",
      ],
    },
    {
      id: 2,
      title: "Mixed-Signal Design",
      description: "Seamless integration of analog and digital technologies",
      icon: Layers,
      details: [
        "Analog-to-Digital Converter (ADC) design",
        "Digital-to-Analog Converter (DAC) implementation",
        "Precision analog circuit development",
        "Mixed-signal system architecture",
        "Signal integrity optimization",
      ],
    },
    {
      id: 3,
      title: "Low-Power SoC Architecture",
      description: "Energy-efficient system-on-chip solutions",
      icon: Zap,
      details: [
        "Ultra-low power design methodologies",
        "Power gating and dynamic voltage scaling",
        "Energy harvesting circuit design",
        "Advanced power management techniques",
        "IoT and mobile device optimization",
      ],
    },
    {
      id: 4,
      title: "Design for Testability (DFT)",
      description: "Comprehensive verification and testing strategies",
      icon: Target,
      details: [
        "Scan chain implementation",
        "Built-in self-test (BIST) techniques",
        "Fault detection and diagnosis",
        "Automated test pattern generation",
        "Reliability and yield improvement",
      ],
    },
    {
      id: 5,
      title: "AI & Machine Learning Accelerators",
      description: "Cutting-edge compute solutions for advanced applications",
      icon: Aperture,
      details: [
        "Neural network hardware acceleration",
        "Custom AI compute architectures",
        "Edge AI optimization",
        "Machine learning inference engines",
        "Specialized AI/ML SoC design",
      ],
    },
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
          Integrated Circuit Design Services
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transforming innovative concepts into advanced semiconductor solutions
          that push the boundaries of technology and performance.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designServices.map((service) => (
          <motion.div
            key={service.id}
            whileHover={{ scale: 1.05 }}
            className={`  
              border rounded-lg p-6 shadow-md cursor-pointer transition-all  
              ${
                activeService === service.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white hover:bg-gray-50"
              }  
            `}
            onClick={() =>
              setActiveService(activeService === service.id ? null : service.id)
            }
          >
            <div className="flex items-center mb-4">
              <service.icon className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-xl font-semibold">{service.title}</h2>
            </div>
            <p className="text-gray-600 mb-2">{service.description}</p>
            {activeService === service.id && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="list-disc list-inside text-gray-700 pl-4"
              >
                {service.details.map((detail, index) => (
                  <li key={index} className="mb-1">
                    {detail}
                  </li>
                ))}
              </motion.ul>
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
        <h2 className="text-2xl font-bold mb-4">Our Design Philosophy</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Innovation-Driven Approach
            </h3>
            <p className="text-gray-700">
              We combine deep technical expertise with creative problem-solving
              to develop semiconductor solutions that address complex
              technological challenges.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">End-to-End Support</h3>
            <p className="text-gray-700">
              From initial concept and architectural design to final production
              and optimization, we provide comprehensive support throughout the
              entire semiconductor development lifecycle.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">
          Ready to Bring Your Concept to Life?
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Let's discuss how our design services can transform your innovative
          ideas into cutting-edge semiconductor solutions.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Contact Our Design Team
        </button>
      </motion.div>
    </motion.section>
  );
}
