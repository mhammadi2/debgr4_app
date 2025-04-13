"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaTwitter,
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa"; // Import icons from react-icons

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-green-700 text-white mt-8 py-6"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between">
        {/* Left column */}
        <div>
          <h2 className="text-lg font-semibold">DeBugR4</h2>
          <p className="text-sm mt-1 text-white/80">
            Innovation in Integrated and Electrical Circuits
          </p>
        </div>

        {/* Middle column */}
        <div className="mt-4 md:mt-0">
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:underline">
                Products
              </Link>
            </li>
            <li>
              <Link href="/design-service" className="hover:underline">
                Design Service
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Right column (socials / contact) */}
        <div className="mt-4 md:mt-0">
          <p className="text-sm">Follow us on:</p>
          <ul className="flex space-x-4 mt-2 text-sm">
            <li>
              <a
                href="https://twitter.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="flex items-center hover:text-blue-400 transition-colors duration-200"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on LinkedIn"
                className="flex items-center hover:text-blue-600 transition-colors duration-200"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="flex items-center hover:text-blue-700 transition-colors duration-200"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="flex items-center hover:text-purple-600 transition-colors duration-200"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom row / copyright */}
      <div className="border-t border-white/20 mt-4 pt-4 text-center text-xs text-white/70">
        © {new Date().getFullYear()} DeBugR4, LLC. All rights reserved.
      </div>
    </motion.footer>
  );
}
