import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Priorización de medicamentos",
  description: "Sistema de priorización de reposición de medicamentos hospitalarios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
