import { ImageResponse } from "next/og";

export const alt = "Who Am I — place yourself in AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#060908",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 100%, #0f2a22 0%, transparent 55%), radial-gradient(ellipse 45% 40% at 12% 18%, #1a3d32 0%, transparent 50%), radial-gradient(ellipse 40% 35% at 90% 20%, #243528 0%, transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#9aafa3",
          }}
        >
          whoami
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 108,
              lineHeight: 0.95,
              fontWeight: 600,
              color: "#e7eee8",
              letterSpacing: "-0.03em",
            }}
          >
            <span>Who</span>
            <span>
              <span style={{ color: "#f0c14d" }}>A</span>m{" "}
              <span style={{ color: "#f0c14d" }}>I</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#9aafa3",
              letterSpacing: "-0.01em",
            }}
          >
            Place yourself in AI.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            height: 4,
            width: 120,
            background: "#f0c14d",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
