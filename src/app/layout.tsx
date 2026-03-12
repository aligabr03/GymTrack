import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata: Metadata = {
    title: "GymTrack — Track Your Gains",
    description:
        "Log workouts, track body metrics, analyze progression, and smash PRs.",
    viewport: {
        width: "device-width",
        initialScale: 1,
        viewportFit: "cover",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased min-h-dvh`}
            >
                {children}
                <Toaster />
            </body>
        </html>
    );
}
