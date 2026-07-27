// One-off generator: renders the app icon that src/app/icon.tsx used to build at
// runtime. Keeping it static removes the next/og resvg rasterizer (about 2.6 MB)
// from the deployed worker bundle. Re-run only if the icon design changes.
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og.js";

const size = { width: 512, height: 512 };

const response = new ImageResponse(
  {
    type: "div",
    props: {
      style: {
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
      },
      children: "11",
    },
  },
  size,
);

const png = Buffer.from(await response.arrayBuffer());
const target = join(process.cwd(), "src", "app", "icon.png");
await writeFile(target, png);
console.log(`wrote ${target} (${png.byteLength} bytes)`);
