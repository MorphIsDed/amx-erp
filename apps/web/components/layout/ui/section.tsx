import { ReactNode } from "react";

export default function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
      {children}
    </div>
  );
}