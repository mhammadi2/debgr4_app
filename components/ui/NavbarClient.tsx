"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart, User as UserIcon, LogOut, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/CartSidebar";
import { useSession, signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import type { Session } from "next-auth";

// --- Sub-components for Readability ---

const UserMenu = ({ user }: { user: Session["user"] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user.role === UserRole.ADMIN;
  const dashboardRoute = isAdmin ? "/admin" : "/profile";
  const displayName = isAdmin ? "Admin" : user.name?.split(" ")[0] || "Account";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center hover:text-gray-200 transition-colors"
        aria-label="Open user menu"
      >
        <UserIcon size={18} className="mr-1.5" /> {displayName}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border"
          onMouseLeave={() => setIsOpen(false)}
        >
          <Link
            href={dashboardRoute}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            {isAdmin ? "Admin Dashboard" : "My Profile"}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut size={16} className="mr-2" /> Sign Out
          </button>
        </motion.div>
      )}
    </div>
  );
};

const AuthButtons = () => (
  <Link
    href="/login"
    className="flex items-center hover:text-gray-200 transition-colors"
  >
    <UserIcon size={18} className="mr-1" /> Login
  </Link>
);

// ✅ CART ICON: Optimized with proper hydration handling
const CartIcon = ({
  onCartClick,
  hasMounted,
}: {
  onCartClick: () => void;
  hasMounted: boolean;
}) => {
  const { getTotalItems } = useCart();
  const totalCartItems = hasMounted ? getTotalItems() : 0;

  const ariaLabel =
    hasMounted && totalCartItems > 0
      ? `Open shopping cart with ${totalCartItems} items`
      : "Open shopping cart";

  return (
    <button
      onClick={onCartClick}
      className="relative hover:text-gray-200 transition-colors p-2 rounded-lg"
      aria-label={ariaLabel}
    >
      <ShoppingCart size={20} />
      {hasMounted && totalCartItems > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-xs rounded-full w-5 h-5 font-bold min-w-[20px]"
        >
          {totalCartItems > 99 ? "99+" : totalCartItems}
        </motion.span>
      )}
    </button>
  );
};

// --- Main Navbar Component ---
export function NavbarClient() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const router = useRouter();

  // ✅ CORRECT: Use useSession hook since session is provided via SessionProvider
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ✅ CHECKOUT HANDLER: Navigate to checkout and close cart
  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  // ✅ MOBILE MENU HANDLER: Close menu when clicking outside
  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/products", label: "Products" },
    { href: "/supply", label: "Supply Parts" },
    { href: "/design-service", label: "Design Service" },
    { href: "/ai-help", label: "AI Help" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        {/* Top Bar */}
        <div className="bg-green-700 text-white">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
            <span>
              <strong>DeBugR4</strong> – IC & Electronic Design
            </span>
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">Contact: (331) 588-5937</span>

              {/* ✅ IMPROVED: Loading state handling */}
              {isLoading ? (
                <div className="w-24 h-5 bg-green-600 rounded animate-pulse" />
              ) : user ? (
                <UserMenu user={user} />
              ) : (
                <AuthButtons />
              )}

              <CartIcon
                onCartClick={() => setIsCartOpen(true)}
                hasMounted={hasMounted}
              />
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto px-4 flex justify-between items-center h-20">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 hover:text-green-700 transition-colors"
          >
            DeBugR4
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-green-700 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-lg"
          >
            <div className="p-6">
              <button
                onClick={handleMobileMenuClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>

              <nav className="flex flex-col space-y-6 mt-12">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg hover:text-green-700 transition-colors font-medium"
                    onClick={handleMobileMenuClose}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
}
