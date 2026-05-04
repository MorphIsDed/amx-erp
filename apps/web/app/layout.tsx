import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AMX ERP",
  description: "Enterprise Resource Planning",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
