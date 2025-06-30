// In: app/(customer)/profile/page.tsx (Updated and Refactored)
"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowRight,
  User,
  AlertCircle,
  Heart,
} from "lucide-react";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { ProfileCard } from "@/components/profile/ProfileCard"; // New component

// Define the SWR fetcher function
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  });

// Define a type for our user data
interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// --- Reusable Loader and Error Components ---
const LoadingState = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md">
      <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-300 rounded"></div>
        <div className="h-4 w-64 bg-gray-300 rounded"></div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-md p-6 h-48"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="max-w-4xl mx-auto p-8 text-center text-red-600 bg-red-50 rounded-lg">
    <AlertCircle className="mx-auto h-12 w-12" />
    <h2 className="mt-4 text-xl font-semibold">Could not load profile</h2>
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

const ProfileHeader = ({ user }: { user: UserProfile }) => (
  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-white rounded-lg shadow-md">
    <Image
      src={user.image || "/default-avatar.png"}
      alt={user.name || "User Avatar"}
      width={80}
      height={80}
      className="rounded-full border-2 border-gray-200"
    />
    <div>
      <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
        {user.name}
      </h1>
      <p className="text-md text-gray-600 text-center sm:text-left">
        {user.email}
      </p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { data: user, error } = useSWR<UserProfile>("/api/profile", fetcher);

  if (error) return <ErrorState message={error.message} />;
  if (!user) return <LoadingState />;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <ProfileHeader user={user} />

      <ProfileCard title="My Account">
        <div className="space-y-4">
          <Link href="/profile/orders" passHref>
            <div className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border">
              <div className="flex items-center">
                <ShoppingBag className="text-blue-600 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-800">My Orders</h3>
                  <p className="text-sm text-gray-500">
                    View order history and status
                  </p>
                </div>
              </div>
              <ArrowRight className="text-gray-400" />
            </div>
          </Link>
          <Link href="/profile/wishlist" passHref>
            <div className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border">
              <div className="flex items-center">
                <Heart className="text-pink-500 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-800">Wishlist</h3>
                  <p className="text-sm text-gray-500">View your saved items</p>
                </div>
              </div>
              <ArrowRight className="text-gray-400" />
            </div>
          </Link>
        </div>
      </ProfileCard>

      <ProfileCard title="Account Settings">
        <SignOutButton />
      </ProfileCard>
    </div>
  );
}
