// app/layout.tsx
import "@/app/globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext"; // Import the CartProvider

export const metadata = {
  title: "Electronic Chip Design & Manufacturing",
  description: "Manage chip design & manufacturing with Next.js & shadcn/ui",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 via-white to-green-200">
        {/* Wrap the entire layout with CartProvider */}
        <CartProvider>
          {/* Two-row Navbar */}
          <Navbar />

          {/* Main content area with a slightly transparent white background for clarity */}
          <main className="container mx-auto px-4 md:px-6 flex-grow mt-4 bg-white/70 rounded-lg shadow-md py-6">
            {children}
          </main>

          {/* Animated Footer */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
