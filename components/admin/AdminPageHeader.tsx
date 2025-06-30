// In: components/admin/AdminPageHeader.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminPageHeaderProps {
  title: string;
  backHref: string;
}

export function AdminPageHeader({ title, backHref }: AdminPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center mb-6 p-4 border-b">
      <button
        onClick={() => router.push(backHref)}
        className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    </div>
  );
}
