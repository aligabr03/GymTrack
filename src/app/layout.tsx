import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const sora = Sora({
    variable: "--font-sora",
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#09090b" },
        { media: "(prefers-color-scheme: light)", color: "#fefdf7" },
    ],
};

export const metadata: Metadata = {
    title: "GymTrack — Track Your Gains",
    description:
        "Log workouts, track body metrics, analyze progression, and smash PRs.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "GymTrack",
    },
    formatDetection: {
        telephone: false,
    },
    other: {
        "mobile-web-app-capable": "yes",
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
                {/* Preconnect to Supabase origins for faster API/auth calls */}
                <link
                    rel="preconnect"
                    href="https://syjgsgkjbipijdrjcxgx.supabase.co"
                />
                <link
                    rel="dns-prefetch"
                    href="https://syjgsgkjbipijdrjcxgx.supabase.co"
                />
            </head>
            <body
                className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased min-h-dvh`}
            >
                {children}
                <Toaster />
                <ServiceWorkerRegistration />
            </body>
        </html>
    );
}
