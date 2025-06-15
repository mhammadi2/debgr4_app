// components/ui/navbar.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Calculate total items in cart
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header>
        {/* Top Bar (Row 1) - dark green background, white text */}
        <div className="bg-green-700 text-white">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <span className="text-sm">
              <strong>DeBugR4</strong> – Leading the Future of IC and Electronic
              Design and Support
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline">
                Contact: (331) 588-5937
              </span>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hover:text-gray-200 transition-colors"
              >
                <ShoppingCart size={20} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar (Row 2) */}
        <motion.nav
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm"
        >
          <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center justify-between py-4">
            {/* Brand / Logo */}
            <Link
              href="/"
              className="flex items-center text-m font-bold tracking-tight text-gray-800"
            >
              <Image
                src="/logo3.png"
                alt="logo"
                width={50}
                height={50}
                className="mr-2"
              />
              DeBugR4
            </Link>

            {/* Hamburger Menu (mobile) */}
            <button
              className="md:hidden block text-gray-700 hover:text-blue-600"
              onClick={toggleMenu}
            >
              <Menu size={24} />
            </button>

            {/* Navigation Links */}
            <div
              className={`${
                isOpen ? "block" : "hidden"
              } w-full md:w-auto md:flex mt-4 md:mt-0`}
            >
              <ul className="flex flex-col md:flex-row md:space-x-6">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About Us" },
                  { href: "/products", label: "Products" },
                  { href: "/supply", label: "Supply Parts" },
                  { href: "/design-service", label: "Design Service" },
                  { href: "/login", label: "Login" },
                  { href: "/ai-help", label: "AI Help" },
                  { href: "/contact", label: "Contact Us" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-2 text-gray-800 hover:text-blue-600 md:p-0"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.nav>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
