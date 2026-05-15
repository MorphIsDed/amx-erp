import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AMX ERP — Enterprise Operating System",
  description: "Next-generation Enterprise Resource Planning with AI-powered insights",
};

export const viewport = {
  themeColor: "#06080d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
