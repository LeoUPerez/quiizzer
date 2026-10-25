import type { Metadata, Viewport } from "next";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiizzer",
  icons: {
    icon: "/images/app_icon.png",
    apple: "/images/app_icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><AuthModalProvider>{children}</AuthModalProvider></body>
    </html>
  );
}
