import { ImageResponse } from "next/og";

export const alt = "Victor Qi.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "white",
          color: "black",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: "96px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 600, letterSpacing: "-4px" }}>
          Victor Qi.
        </div>
        <div style={{ color: "#737373", fontSize: 30, marginTop: 24 }}>
          victorqi.me
        </div>
      </div>
    ),
    size,
  );
}