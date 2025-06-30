// In: components/ui/SignOutButton.tsx
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <div
      className="flex justify-between items-center p-4 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <div className="flex items-center">
        <LogOut className="text-red-600 mr-4" />
        <div>
          <h3 className="font-medium text-gray-800">Sign Out</h3>
          <p className="text-sm text-gray-500">End your current session</p>
        </div>
      </div>
    </div>
  );
}
export default SignOutButton;
