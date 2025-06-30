// app/admin/customers/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Users,
  Search,
  AlertCircle,
  Edit2,
  Key,
  Mail,
  Trash2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CustomersManagementPage() {
  const {
    data: users,
    error,
    mutate,
  } = useSWR<any[]>("/api/admin/users", fetcher);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  const filteredUsers =
    users?.filter((user) => {
      const matchSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    }) || [];

  const startEditing = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName("");
    setEditEmail("");
    setEditRole("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          name: editName,
          email: editEmail,
          role: editRole,
        }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || "Failed to update user");
      }
      mutate(); // Revalidate SWR cache
      cancelEdit();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || "Failed to delete user");
      }
      mutate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error)
    return (
      <div className="text-red-600 flex items-center">
        <AlertCircle className="mr-2" /> Error loading users: {error.message}
      </div>
    );
  if (!users)
    return (
      <div className="flex items-center text-gray-600">
        <Users className="mr-2 animate-pulse" /> Loading users...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2" /> Customer Management
        </h1>
      </div>

      {/* EDIT USER FORM */}
      {editingUser && (
        <form
          onSubmit={handleUpdateUser}
          className="p-6 border border-yellow-300 rounded-lg shadow-sm bg-yellow-50 space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            Edit User: {editingUser.email}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              required
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update User"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SEARCH */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* USER TABLE */}
      {filteredUsers.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
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
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created At
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() => startEditing(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit User"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
