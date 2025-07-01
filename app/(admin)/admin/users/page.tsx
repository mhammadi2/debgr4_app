// File: app/(admin)/admin/users/page.tsx

"use client";

import useSWR from "swr";
import { useState } from "react";
import { Loader2, AlertTriangle, Users } from "lucide-react";

// You can define this type in a separate types file for reusability
type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "INACTIVE";
  emailVerified: Date | null;
};

// A dedicated component for the user table
function UserTable({ users, onUpdate, isLoading }) {
  const handleUpdate = (userId, field, value) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const updatedData = { ...user, [field]: value };
      onUpdate(userId, updatedData.role, updatedData.status);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Role
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users?.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.status}
                  onChange={(e) =>
                    handleUpdate(user.id, "status", e.target.value)
                  }
                  disabled={isLoading}
                  className={`p-1 rounded-md text-xs ${
                    user.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleUpdate(user.id, "role", e.target.value)
                  }
                  disabled={isLoading}
                  className="p-1 rounded-md text-xs bg-gray-100"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UserManagementPage() {
  const [isUpdating, setIsUpdating] = useState(false);

  // SWR will fetch data from our API and handle caching, revalidation, etc.
  const {
    data: users,
    error,
    isLoading,
    mutate,
  } = useSWR<User[]>("/api/admin/users");

  const handleUpdateUser = async (
    id: string,
    role: User["role"],
    status: User["status"]
  ) => {
    setIsUpdating(true);
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role, status }),
    });
    // Tell SWR to re-fetch the data to get the latest state
    mutate();
    setIsUpdating(false);
  };

  // --- Render logic ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
        <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
        <p className="text-sm text-red-800">
          Failed to load users. {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">
          User Management
        </h1>
        <p className="text-sm text-gray-500">
          View, edit roles, and manage user status.
        </p>
      </header>

      {(isLoading || isUpdating) && <Loader2 className="animate-spin" />}

      {!isLoading && users && (
        <UserTable
          users={users}
          onUpdate={handleUpdateUser}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}
