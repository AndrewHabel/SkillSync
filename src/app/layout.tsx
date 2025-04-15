import type { Metadata } from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import "./nprogress.css"; // Import NProgress CSS
import {cn} from "@/lib/utils"
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/nprogress"; // Import the NavigationProgress component


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSync",
  description: "GradProject",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased min-h-screen")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavigationProgress />
          <QueryProvider>
            <Toaster />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}