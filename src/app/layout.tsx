import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AccentProvider } from "@/components/layout/accent-provider";

export const metadata: Metadata = {
  title: "TaskFlow — Team Task Management",
  description: "Modern task management for high-performing teams",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TaskFlow",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans tracking-[-0.5px]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AccentProvider>
            {children}
            <Toaster />
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
