import type { Metadata } from "next"; // this imports the Typescript type for metadata. Used for SEO (title, description, meta tags ; Recommended for SEO and production apps)
import "./globals.css"; // loads global CSS, similar to importing index.css in React. Without it, Tailwind/global styles won't work
import Navbar from "@/components/navbar";
import { AppProvider } from "./context/AppContext";
import { SidebarProvider } from "@/components/ui/sidebar";

// Metadata (SEO) - No need for react-helmet

export const metadata: Metadata = {
  title: "InkFlow",
  description: "AI-powered Blog App",
};

// The root layout component. children = every page in your app. Mandatory.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

/*
layout.tsx is a global wrapper for your app. It persists across page navigation. Every page (page.tsx) is rendered inside this layout. 
*/
