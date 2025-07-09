import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user || session.user.role !== "USER") {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Common navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium flex items-center">
            <User className="h-4 w-4 mr-1" />
            Profile
          </span>
        </nav>

        {children}
      </div>
    </div>
  );
}
