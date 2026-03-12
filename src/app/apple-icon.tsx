import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "#09090b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Left plate */}
            <div
                style={{
                    position: "absolute",
                    left: 25,
                    top: 66,
                    width: 23,
                    height: 48,
                    borderRadius: 6,
                    background: "#fafafa",
                }}
            />
            {/* Left collar */}
            <div
                style={{
                    position: "absolute",
                    left: 48,
                    top: 76,
                    width: 13,
                    height: 28,
                    borderRadius: 3,
                    background: "#fafafa",
                }}
            />
            {/* Handle */}
            <div
                style={{
                    position: "absolute",
                    left: 61,
                    top: 84,
                    width: 58,
                    height: 12,
                    borderRadius: 6,
                    background: "#fafafa",
                }}
            />
            {/* Right collar */}
            <div
                style={{
                    position: "absolute",
                    left: 119,
                    top: 76,
                    width: 13,
                    height: 28,
                    borderRadius: 3,
                    background: "#fafafa",
                }}
            />
            {/* Right plate */}
            <div
                style={{
                    position: "absolute",
                    left: 132,
                    top: 66,
                    width: 23,
                    height: 48,
                    borderRadius: 6,
                    background: "#fafafa",
                }}
            />
        </div>,
        { ...size },
    );
}
