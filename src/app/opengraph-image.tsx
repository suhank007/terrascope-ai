import { ImageResponse } from "next/og";

export const alt = "TerraScope AI: Real-Time Global Intelligence Platform";
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
          backgroundColor: "#ffffff",
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
              border: "1px solid rgba(0, 98, 227, 0.35)",
              backgroundColor: "rgba(0, 98, 227, 0.08)",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, backgroundColor: "#0a7d4e" }} />
            <div style={{ display: "flex", fontSize: 22, color: "#55657a", letterSpacing: 3, textTransform: "uppercase" }}>
              Live
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#0b1d33" }}>TerraScope</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#0062e3" }}>AI</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#55657a", marginTop: 20, maxWidth: 920 }}>
          Know what is happening before you go: live hazards, advisories, weather and airport conditions, with sources.
        </div>
      </div>
    ),
    { ...size }
  );
}
