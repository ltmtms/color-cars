import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Colour-a-Car — print, scan & parade!",
  description:
    "Kids colour a paper car, scan it with a camera, and watch it join a cute rolling showcase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <header className="no-print sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b border-rose-100">
          <SiteNav />
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print text-center text-xs text-slate-500 py-6">
          Made for playful classrooms — colour, scan, celebrate!
        </footer>
      </body>
    </html>
  );
}
