// app/(public)/layout.tsx (The layout for your public-facing site)

import { ReactNode } from "react";
import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  // This is where your previous logic now lives.
  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-6 md:px-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
