import { ImageResponse } from "next/og";

export const alt = "TerraScope AI — Real-Time Global Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#05070a",
          padding: "90px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 16,
              border: "1px solid rgba(53, 224, 200, 0.35)",
              backgroundColor: "rgba(53, 224, 200, 0.12)",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, backgroundColor: "#35e0c8" }} />
            <div style={{ display: "flex", fontSize: 22, color: "#8891a1", letterSpacing: 3, textTransform: "uppercase" }}>
              Live
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#eef1f5" }}>TerraScope</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#35e0c8" }}>AI</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#8891a1", marginTop: 20, maxWidth: 920 }}>
          Real-time global intelligence — earthquakes, weather, flights, and wildfires, live on a 3D globe.
        </div>
      </div>
    ),
    { ...size }
  );
}
