// In: components/admin/SettingsCard.tsx
import { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
