import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 112,
        background: "#f5f1e8",
        color: "#3f5142",
        fontFamily: "serif",
        fontSize: 238,
        letterSpacing: -26,
      }}
    >
      11
    </div>,
    size,
  );
}
