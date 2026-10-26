import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RegistrarSw } from "@/features/pwa/components/registrar-sw";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meraki",
    template: "%s · Meraki",
  },
  description: "Gestión de consultorio psicológico: expedientes, agenda y sesiones.",
  robots: { index: false, follow: false },
  applicationName: "Meraki",
  appleWebApp: { capable: true, title: "Meraki" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6534a8" },
    { media: "(prefers-color-scheme: dark)", color: "#160f22" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" suppressHydrationWarning className={`${nunito.variable} ${quicksand.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" richColors closeButton />
          <RegistrarSw />
        </ThemeProvider>
      </body>
    </html>
  );
}
