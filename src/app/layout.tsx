import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeSync } from "@/components/layout/ThemeSync";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Valor AppStudio — AI-Powered Mobile App Builder & Tutor",
  description:
    "Valor AppStudio guides you through Understand → Plan → Build → Explain → Learn to generate runnable Expo mobile apps with complete understanding.",
  icons: { icon: "/favicon.ico" },
};

const themeScript = `try{var s=JSON.parse(localStorage.getItem('valor-appstudio')||'{}');var t=s.state&&s.state.settings&&s.state.settings.theme;if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <ThemeSync />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
