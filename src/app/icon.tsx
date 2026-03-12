import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "#09090b",
                borderRadius: "115px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Left plate */}
            <div
                style={{
                    position: "absolute",
                    left: 72,
                    top: 188,
                    width: 64,
                    height: 136,
                    borderRadius: 16,
                    background: "#fafafa",
                }}
            />
            {/* Left collar */}
            <div
                style={{
                    position: "absolute",
                    left: 136,
                    top: 216,
                    width: 36,
                    height: 80,
                    borderRadius: 8,
                    background: "#fafafa",
                }}
            />
            {/* Handle */}
            <div
                style={{
                    position: "absolute",
                    left: 172,
                    top: 240,
                    width: 168,
                    height: 32,
                    borderRadius: 16,
                    background: "#fafafa",
                }}
            />
            {/* Right collar */}
            <div
                style={{
                    position: "absolute",
                    left: 340,
                    top: 216,
                    width: 36,
                    height: 80,
                    borderRadius: 8,
                    background: "#fafafa",
                }}
            />
            {/* Right plate */}
            <div
                style={{
                    position: "absolute",
                    left: 376,
                    top: 188,
                    width: 64,
                    height: 136,
                    borderRadius: 16,
                    background: "#fafafa",
                }}
            />
        </div>,
        { ...size },
    );
}
