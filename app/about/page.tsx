"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Globe,
  Users,
  Zap,
  Target,
  Rocket,
  Send,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const companyValues = [
    {
      icon: Rocket,
      title: "Innovation",
      description:
        "Pushing the boundaries of semiconductor design through continuous experimentation and breakthrough technologies.",
    },
    {
      icon: Target,
      title: "Quality",
      description:
        "Rigorous testing and validation ensuring unparalleled reliability from prototype to mass production.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description:
        "Treating every client as a strategic partner, co-creating solutions that exceed expectations.",
    },
    {
      icon: Zap,
      title: "Sustainability",
      description:
        "Committed to eco-friendly processes, energy-efficient designs, and responsible manufacturing.",
    },
  ];

  const teamMembers = [
    {
      name: "Dr. Zakir Hossain",
      role: "Chief Technology Officer",
      expertise: "Advanced IC Design",
    },
    {
      name: "Muhammad Islam",
      role: "Chief Design Engineer",
      expertise: "SoC Development",
    },
    {
      name: "Muhammad Islam",
      role: "Head of Innovation",
      expertise: "AI and Machine Learning Chips",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <section className="text-center mb-16">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold mb-6 text-gray-800"
        >
          Innovating Tomorrow's Technology
        </motion.h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          We are a cutting-edge semiconductor design company dedicated to
          creating transformative technologies that power the future of digital
          innovation.
        </p>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 gap-12 mb-16"
      >
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            At DeBugR4, we're committed to pushing the boundaries of
            semiconductor design. Our mission is to develop innovative,
            efficient, and transformative chip technologies that solve complex
            technological challenges across industries.
          </p>
          <div className="flex space-x-4 mt-6">
            {companyValues.map((value, index) => (
              <div key={index} className="text-center">
                <value.icon className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                <h3 className="font-semibold">{value.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Core Leadership</h2>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="mb-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
              <p className="text-sm text-gray-500">{member.expertise}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center bg-blue-50 p-12 rounded-lg"
      >
        <h2 className="text-3xl font-bold mb-6">Ready to Collaborate?</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Whether you're looking to develop cutting-edge semiconductor solutions
          or explore innovative design services, our team is ready to turn your
          technological vision into reality.
        </p>
        <div className="flex justify-center space-x-6">
          <Link
            href="/contact"
            className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="mr-2" /> Contact Our Team
          </Link>
          <Link
            href="/design-service"
            className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Cpu className="mr-2" /> Explore Design Services
            <ArrowRight className="ml-2" />
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}
