import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-white antialiased">
        {children}
      </body>
    </html>
  );
}