// In: components/profile/ProfileCard.tsx
import { ReactNode } from "react";

interface ProfileCardProps {
  title: string;
  children: ReactNode;
}

export function ProfileCard({ title, children }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
