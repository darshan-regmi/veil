// Build the Veil logo: outline LibreBaskerville-Bold "V" + saffron rule,
// then rasterize the standard, adaptive, splash, and favicon PNG variants.
//
// Re-run any time the source design changes:
//   node scripts/build-logo.mjs
//
// Outputs:
//   assets/logo/option-a-typographic.svg     (outlined source, font-independent)
//   assets/logo/option-a-adaptive.svg        (smaller V for Android safe zone)
//   assets/images/icon.png                   (1024 — standard app icon)
//   assets/images/adaptive-icon.png          (1024 — Android adaptive foreground)
//   assets/images/splash-icon.png            (1024 — splash screen)
//   assets/images/favicon.png                (48 — web favicon)

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const FONT_PATH = path.join(
  ROOT,
  "node_modules/@expo-google-fonts/libre-baskerville/700Bold/LibreBaskerville_700Bold.ttf"
);
const SVG_OUT_FULL = path.join(ROOT, "assets/logo/option-a-typographic.svg");
const SVG_OUT_ADAPTIVE = path.join(ROOT, "assets/logo/option-a-adaptive.svg");
const IMAGES_DIR = path.join(ROOT, "assets/images");

const CANVAS = 1024;
const INK = "#0A0A0A";
const ACCENT = "#C84B31";
const BG = "#FFFFFF";

// Android adaptive icon (dark): foreground is transparent so Android composites
// it over the backgroundColor set in app.config.ts. Use the dark-palette V
// color (warm off-white) and the dark-palette saffron (brighter for contrast).
const DARK_BG = "#0F0F10";
const INK_LIGHT = "#F0EDE6";
const ACCENT_DARK = "#E66B4D";

// Render the "V" glyph as an SVG path string, sized so its visible cap height
// equals `capHeight` and centered horizontally on `centerX`. Baseline is set
// so the glyph's visual center sits at `centerY`.
function renderVGlyph(font, { capHeight, centerX, centerY }) {
  const glyph = font.charToGlyph("V");
  // Find scale so the glyph's bounding box height equals capHeight
  const probe = glyph.getPath(0, 0, 1000);
  const bbox = probe.getBoundingBox();
  const glyphHeight = bbox.y2 - bbox.y1;
  const glyphWidth = bbox.x2 - bbox.x1;
  const scale = capHeight / glyphHeight;
  const fontSize = 1000 * scale;

  // After scaling: actual bbox in user space
  const scaledWidth = glyphWidth * scale;
  const scaledHeight = glyphHeight * scale;
  const scaledBboxX1 = bbox.x1 * scale;
  const scaledBboxY1 = bbox.y1 * scale;

  // We want the bbox centered at (centerX, centerY)
  // getPath(x, y, fontSize) draws the glyph with its baseline at y and pen at x.
  // Final glyph extent in user space: [x + bbox.x1*scale, x + bbox.x2*scale] horizontally
  //                                   [y + bbox.y1*scale, y + bbox.y2*scale] vertically
  //                                   (note bbox y is in font's y-down coords after toSVG)
  // For sharp/SVG (y-down), the path uses negated y. opentype.js handles this in toSVG.
  const x = centerX - scaledBboxX1 - scaledWidth / 2;
  const y = centerY - scaledBboxY1 - scaledHeight / 2;

  const positioned = glyph.getPath(x, y, fontSize);
  return positioned.toSVG(2);
}

function composeLayout({ capHeight, ruleWidth, ruleHeight, ruleGap }) {
  const totalHeight = capHeight + ruleGap + ruleHeight;
  const groupCenterY = CANVAS / 2;
  const groupTop = groupCenterY - totalHeight / 2;
  return {
    vCenterY: groupTop + capHeight / 2,
    ruleY: groupTop + capHeight + ruleGap,
    ruleX: (CANVAS - ruleWidth) / 2,
  };
}

function buildSVG(opts, font) {
  const { vCenterY, ruleY, ruleX } = composeLayout(opts);
  const vPath = renderVGlyph(font, {
    capHeight: opts.capHeight,
    centerX: CANVAS / 2,
    centerY: vCenterY,
  });
  const vPathWithFill = vPath.replace("<path ", `<path fill="${INK}" `);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CANVAS}" height="${CANVAS}" fill="${BG}"/>
  ${vPathWithFill}
  <rect x="${ruleX.toFixed(2)}" y="${ruleY.toFixed(2)}" width="${opts.ruleWidth}" height="${opts.ruleHeight}" fill="${ACCENT}"/>
</svg>
`;
}

// Foreground for Android adaptive icon: NO background rect so the PNG is
// transparent and Android composites it over the backgroundColor layer.
function buildAdaptiveForegroundSVG(opts, font) {
  const { vCenterY, ruleY, ruleX } = composeLayout(opts);
  const vPath = renderVGlyph(font, {
    capHeight: opts.capHeight,
    centerX: CANVAS / 2,
    centerY: vCenterY,
  });
  const vPathWithFill = vPath.replace("<path ", `<path fill="${INK_LIGHT}" `);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}" xmlns="http://www.w3.org/2000/svg">
  ${vPathWithFill}
  <rect x="${ruleX.toFixed(2)}" y="${ruleY.toFixed(2)}" width="${opts.ruleWidth}" height="${opts.ruleHeight}" fill="${ACCENT_DARK}"/>
</svg>
`;
}

// Same composition as the adaptive foreground but with the dark bg painted in
// — for previewing on disk what the final layered icon will look like.
function buildAdaptiveDarkPreviewSVG(opts, font) {
  const { vCenterY, ruleY, ruleX } = composeLayout(opts);
  const vPath = renderVGlyph(font, {
    capHeight: opts.capHeight,
    centerX: CANVAS / 2,
    centerY: vCenterY,
  });
  const vPathWithFill = vPath.replace("<path ", `<path fill="${INK_LIGHT}" `);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${CANVAS}" height="${CANVAS}" fill="${DARK_BG}"/>
  ${vPathWithFill}
  <rect x="${ruleX.toFixed(2)}" y="${ruleY.toFixed(2)}" width="${opts.ruleWidth}" height="${opts.ruleHeight}" fill="${ACCENT_DARK}"/>
</svg>
`;
}

async function main() {
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Font not found at ${FONT_PATH}`);
  }
  const font = opentype.parse(fs.readFileSync(FONT_PATH).buffer);

  // Standard light icon (iOS + web favicon + splash). V fills ~52% of canvas.
  const fullSVG = buildSVG(
    {
      capHeight: 540,
      ruleWidth: 200,
      ruleHeight: 14,
      ruleGap: 36,
    },
    font
  );

  // Android adaptive: foreground must live inside the inner ~66% safe zone
  // (about 680×680 of the 1024 canvas). Drop V to ~34% of canvas.
  const adaptiveOpts = {
    capHeight: 340,
    ruleWidth: 132,
    ruleHeight: 10,
    ruleGap: 26,
  };
  const adaptiveForegroundSVG = buildAdaptiveForegroundSVG(adaptiveOpts, font);
  const adaptiveDarkPreviewSVG = buildAdaptiveDarkPreviewSVG(adaptiveOpts, font);

  fs.mkdirSync(path.dirname(SVG_OUT_FULL), { recursive: true });
  fs.writeFileSync(SVG_OUT_FULL, fullSVG);
  fs.writeFileSync(SVG_OUT_ADAPTIVE, adaptiveDarkPreviewSVG);
  console.log("Wrote outlined source SVGs:");
  console.log(" •", path.relative(ROOT, SVG_OUT_FULL));
  console.log(" •", path.relative(ROOT, SVG_OUT_ADAPTIVE), "(dark preview)");

  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // Standard PNGs render onto a white background.
  const lightTasks = [
    { name: "icon.png", svg: fullSVG, size: 1024 },
    { name: "splash-icon.png", svg: fullSVG, size: 1024 },
    { name: "favicon.png", svg: fullSVG, size: 48 },
  ];
  for (const t of lightTasks) {
    const out = path.join(IMAGES_DIR, t.name);
    await sharp(Buffer.from(t.svg))
      .resize(t.size, t.size, { fit: "contain", background: BG })
      .png()
      .toFile(out);
    console.log(` • ${path.relative(ROOT, out)} (${t.size}×${t.size})`);
  }

  // Adaptive icon: transparent PNG so Android composites over the dark
  // backgroundColor set in app.config.ts.
  const adaptiveOut = path.join(IMAGES_DIR, "adaptive-icon.png");
  await sharp(Buffer.from(adaptiveForegroundSVG))
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(adaptiveOut);
  console.log(
    ` • ${path.relative(ROOT, adaptiveOut)} (1024×1024, transparent → composited over ${DARK_BG})`
  );

  console.log(
    `\nDone. Make sure app.config.ts sets adaptiveIcon.backgroundColor = "${DARK_BG}".`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
