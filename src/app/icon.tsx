import { ImageResponse } from "next/og";

export const size = { width: 42, height: 42 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #a855f7, #030097)",
          borderRadius: 8,
          color: "white",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        C&M
      </div>
    ),
    { ...size },
  );
}
