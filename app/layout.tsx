import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/redux/provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Mini Kanban",
  description: "Mini Kanban Board Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
        <Toaster 
         position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}