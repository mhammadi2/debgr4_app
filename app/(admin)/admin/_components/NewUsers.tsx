// File: app/(admin)/admin/_components/NewUsers.tsx

"use client";

import { NewUser } from "./RecentActivity"; // Import the type from the parent
import { User, Users } from "lucide-react";
import Link from "next/link";

interface NewUsersProps {
  users: NewUser[] | undefined; // It can receive an array or be undefined during load
}

export const NewUsers = ({ users }: NewUsersProps) => {
  // 🛡️ --- THE SAFETY GUARD --- 🛡️
  // This check prevents any crashes. If `users` is undefined, null, or an empty
  // array, it renders a helpful placeholder message instead of trying to .map().
  if (!users || users.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm text-center h-full flex flex-col justify-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-800">
          No Recent Signups
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          New users who register will appear here.
        </p>
      </div>
    );
  }

  // If the guard passes, `users` is a valid, non-empty array. The .map() is now safe.
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">New Users</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <Link
            href={`/admin/customers/${user.id}`} // Link to the specific customer page
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-full mr-3 group-hover:bg-white">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {user.name || "Unnamed User"}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
