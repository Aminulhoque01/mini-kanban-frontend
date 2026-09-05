import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/redux/provider";

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
      </body>
    </html>
  );
}