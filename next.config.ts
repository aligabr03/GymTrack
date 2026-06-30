import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ── View Transitions: native-feel page switches ──
    experimental: {
        viewTransition: true,
    },
    // ── Bundle-size: tree-shake icon library ──
    transpilePackages: ["lucide-react"],
    // ── Headers: enable View Transitions & HSTS ──
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
