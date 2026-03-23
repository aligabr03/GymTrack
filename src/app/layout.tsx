import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const sora = Sora({
    variable: "--font-sora",
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#09090b",
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
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
            <body
                className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased min-h-dvh`}
            >
                {children}
                <Toaster />
            </body>
        </html>
    );
}
