/**
 * Generates original placeholder artwork (SVG) and a small valid PDF so the
 * seeded site renders every section without any third-party images.
 */

const NAVY = "#1F2A44";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrap(text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

/** A simple paper-craft motif built from shapes (no emoji/fonts needed). */
function motif(kind: string, cx: number, cy: number, r: number, accent: string): string {
  const s = `stroke="${NAVY}" stroke-width="${Math.max(3, r / 22)}" stroke-linejoin="round"`;
  switch (kind) {
    case "pumpkin":
      return `<g ${s}><ellipse cx="${cx - r * 0.45}" cy="${cy}" rx="${r * 0.55}" ry="${r * 0.8}" fill="${accent}"/><ellipse cx="${cx + r * 0.45}" cy="${cy}" rx="${r * 0.55}" ry="${r * 0.8}" fill="${accent}"/><ellipse cx="${cx}" cy="${cy}" rx="${r * 0.55}" ry="${r * 0.85}" fill="${accent}"/><rect x="${cx - r * 0.08}" y="${cy - r * 1.15}" width="${r * 0.16}" height="${r * 0.4}" rx="${r * 0.05}" fill="#14998A"/></g>`;
    case "leaf":
      return `<g ${s}><path d="M${cx} ${cy - r} C ${cx + r} ${cy - r * 0.6}, ${cx + r * 0.8} ${cy + r * 0.6}, ${cx} ${cy + r} C ${cx - r * 0.8} ${cy + r * 0.6}, ${cx - r} ${cy - r * 0.6}, ${cx} ${cy - r} Z" fill="${accent}"/><path d="M${cx} ${cy - r * 0.8} L${cx} ${cy + r * 1.25}" fill="none"/></g>`;
    case "house":
      return `<g ${s}><rect x="${cx - r * 0.75}" y="${cy - r * 0.2}" width="${r * 1.5}" height="${r * 1.1}" fill="${accent}"/><path d="M${cx - r} ${cy - r * 0.15} L${cx} ${cy - r} L${cx + r} ${cy - r * 0.15} Z" fill="#1F2A44"/><rect x="${cx - r * 0.18}" y="${cy + r * 0.35}" width="${r * 0.36}" height="${r * 0.55}" fill="#FFD84D"/><circle cx="${cx - r * 0.45}" cy="${cy + r * 0.15}" r="${r * 0.13}" fill="#FFD84D"/><circle cx="${cx + r * 0.45}" cy="${cy + r * 0.15}" r="${r * 0.13}" fill="#FFD84D"/></g>`;
    case "heart":
      return `<g ${s}><path d="M${cx} ${cy + r * 0.9} C ${cx - r * 1.4} ${cy}, ${cx - r * 0.9} ${cy - r * 1.1}, ${cx} ${cy - r * 0.35} C ${cx + r * 0.9} ${cy - r * 1.1}, ${cx + r * 1.4} ${cy}, ${cx} ${cy + r * 0.9} Z" fill="${accent}"/></g>`;
    case "snowflake": {
      let arms = "";
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        arms += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><circle cx="${x}" cy="${y}" r="${r * 0.12}" fill="${accent}"/>`;
      }
      return `<g ${s} stroke-linecap="round">${arms}<circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="${accent}"/></g>`;
    }
    case "star": {
      let d = "";
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (Math.PI / 5) * i;
        const rr = i % 2 ? r * 0.45 : r;
        d += `${i ? "L" : "M"}${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr} `;
      }
      return `<path d="${d}Z" fill="${accent}" ${s}/>`;
    }
    case "flower": {
      let petals = "";
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        petals += `<ellipse cx="${cx + Math.cos(a) * r * 0.55}" cy="${cy + Math.sin(a) * r * 0.55}" rx="${r * 0.4}" ry="${r * 0.4}" fill="${accent}"/>`;
      }
      return `<g ${s}>${petals}<circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="#FFD84D"/></g>`;
    }
    case "bunny":
      return `<g ${s}><ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.9}" rx="${r * 0.22}" ry="${r * 0.6}" fill="${accent}"/><ellipse cx="${cx + r * 0.35}" cy="${cy - r * 0.9}" rx="${r * 0.22}" ry="${r * 0.6}" fill="${accent}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.75}" fill="${accent}"/><circle cx="${cx - r * 0.25}" cy="${cy - r * 0.1}" r="${r * 0.08}" fill="${NAVY}"/><circle cx="${cx + r * 0.25}" cy="${cy - r * 0.1}" r="${r * 0.08}" fill="${NAVY}"/><circle cx="${cx}" cy="${cy + r * 0.15}" r="${r * 0.1}" fill="#FBD9E5"/></g>`;
    case "sun": {
      let rays = "";
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI / 6) * i;
        rays += `<line x1="${cx + Math.cos(a) * r * 0.75}" y1="${cy + Math.sin(a) * r * 0.75}" x2="${cx + Math.cos(a) * r * 1.1}" y2="${cy + Math.sin(a) * r * 1.1}"/>`;
      }
      return `<g ${s} stroke-linecap="round">${rays}<circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="${accent}"/></g>`;
    }
    case "pencil":
      return `<g ${s} transform="rotate(-30 ${cx} ${cy})"><rect x="${cx - r * 0.25}" y="${cy - r}" width="${r * 0.5}" height="${r * 1.5}" fill="${accent}"/><path d="M${cx - r * 0.25} ${cy + r * 0.5} L${cx} ${cy + r * 1.05} L${cx + r * 0.25} ${cy + r * 0.5} Z" fill="#FDE3D3"/><rect x="${cx - r * 0.25}" y="${cy - r * 1.2}" width="${r * 0.5}" height="${r * 0.22}" fill="#FBD9E5"/></g>`;
    case "turkey": {
      const cols = ["#F26B1D", "#FFD84D", "#14998A", "#FBD9E5", "#F26B1D"];
      let fan = "";
      cols.forEach((c, i) => {
        const a = Math.PI + (Math.PI / 4) * i;
        fan += `<ellipse cx="${cx + Math.cos(a) * r * 0.7}" cy="${cy + Math.sin(a) * r * 0.7}" rx="${r * 0.28}" ry="${r * 0.55}" transform="rotate(${(a * 180) / Math.PI + 90} ${cx + Math.cos(a) * r * 0.7} ${cy + Math.sin(a) * r * 0.7})" fill="${c}"/>`;
      });
      return `<g ${s}>${fan}<circle cx="${cx}" cy="${cy + r * 0.1}" r="${r * 0.5}" fill="#B5651D"/><circle cx="${cx}" cy="${cy - r * 0.35}" r="${r * 0.3}" fill="#B5651D"/><path d="M${cx - r * 0.06} ${cy - r * 0.3} l${r * 0.12} 0 l${-r * 0.06} ${r * 0.14}Z" fill="#FFD84D"/></g>`;
    }
    case "reindeer":
      return `<g ${s}><path d="M${cx - r * 0.4} ${cy - r * 0.6} l${-r * 0.3} ${-r * 0.5} m${r * 0.15} ${r * 0.25} l${-r * 0.3} ${-r * 0.05} M${cx + r * 0.4} ${cy - r * 0.6} l${r * 0.3} ${-r * 0.5} m${-r * 0.15} ${r * 0.25} l${r * 0.3} ${-r * 0.05}" fill="none" stroke-linecap="round"/><ellipse cx="${cx}" cy="${cy}" rx="${r * 0.6}" ry="${r * 0.75}" fill="${accent}"/><circle cx="${cx}" cy="${cy + r * 0.45}" r="${r * 0.18}" fill="#E63946"/><circle cx="${cx - r * 0.22}" cy="${cy - r * 0.15}" r="${r * 0.08}" fill="${NAVY}"/><circle cx="${cx + r * 0.22}" cy="${cy - r * 0.15}" r="${r * 0.08}" fill="${NAVY}"/></g>`;
    case "crane":
      return `<g ${s}><path d="M${cx - r} ${cy} L${cx} ${cy - r * 0.2} L${cx + r} ${cy - r * 0.9} L${cx + r * 0.3} ${cy + r * 0.2} L${cx + r * 0.8} ${cy + r * 0.2} L${cx} ${cy + r * 0.6} Z" fill="${accent}"/><path d="M${cx} ${cy - r * 0.2} L${cx - r * 0.2} ${cy - r} L${cx + r * 0.3} ${cy + r * 0.2}" fill="#FFF1C1"/></g>`;
    case "grid": {
      let cells = "";
      const size = r * 0.55;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          cells += `<rect x="${cx - size * 1.5 + i * size}" y="${cy - size * 1.5 + j * size}" width="${size}" height="${size}" fill="${(i + j) % 2 ? "#fff" : accent}"/>`;
      return `<g ${s}>${cells}</g>`;
    }
    default:
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" stroke="${NAVY}" stroke-width="4"/>`;
  }
}

function confetti(w: number, h: number, seed: number): string {
  const colors = ["#F26B1D", "#14998A", "#FFD84D", "#FBD9E5"];
  let out = "";
  let x = seed;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 14; i++) {
    const cx = rnd() * w;
    const cy = rnd() * h;
    const c = colors[i % 4];
    out += i % 2 ? `<circle cx="${cx}" cy="${cy}" r="${8 + rnd() * 8}" fill="${c}" stroke="${NAVY}" stroke-width="2.5"/>` : `<rect x="${cx}" y="${cy}" width="18" height="18" fill="${c}" stroke="${NAVY}" stroke-width="2.5" transform="rotate(45 ${cx + 9} ${cy + 9})"/>`;
  }
  return out;
}

/** Tall 1000x1500 Pinterest pin graphic. */
export function pinSvg(o: { title: string; kicker: string; bg: string; accent: string; motif: string; brand: string; seed: number }): string {
  const lines = wrap(o.title.toUpperCase(), 16).slice(0, 5);
  const startY = 980;
  const text = lines.map((l, i) => `<text x="500" y="${startY + i * 84}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="74" fill="${NAVY}">${esc(l)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">
<rect width="1000" height="1500" fill="${o.bg}"/>${confetti(1000, 760, o.seed)}
<circle cx="500" cy="470" r="330" fill="#fff" stroke="${NAVY}" stroke-width="6"/>
${motif(o.motif, 500, 480, 210, o.accent)}
<rect x="80" y="${startY - 150}" width="840" height="${lines.length * 84 + 120}" rx="14" fill="#fff" stroke="${NAVY}" stroke-width="6"/>
<rect x="300" y="${startY - 200}" width="400" height="76" rx="38" fill="#FFD84D" stroke="${NAVY}" stroke-width="5"/>
<text x="500" y="${startY - 150}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="34" fill="${NAVY}">${esc(o.kicker.toUpperCase())}</text>
${text}
<rect x="0" y="1410" width="1000" height="90" fill="${NAVY}"/>
<text x="500" y="1468" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="36" fill="#fff">${esc(o.brand)}</text>
</svg>`;
}

/** 1200x900 featured "photo" placeholder. */
export function featuredSvg(o: { bg: string; accent: string; motif: string; seed: number }): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
<rect width="1200" height="900" fill="${o.bg}"/>
<rect x="0" y="640" width="1200" height="260" fill="#E8D5B5"/>
<path d="M0 640 H1200" stroke="${NAVY}" stroke-width="4"/>${confetti(1200, 600, o.seed + 7)}
<rect x="380" y="200" width="440" height="520" rx="10" fill="#fff" stroke="${NAVY}" stroke-width="5" transform="rotate(-4 600 460)"/>
${motif(o.motif, 600, 440, 170, o.accent)}
<rect x="860" y="560" width="40" height="190" rx="8" fill="#F26B1D" stroke="${NAVY}" stroke-width="4" transform="rotate(25 880 655)"/>
<circle cx="250" cy="700" r="60" fill="#14998A" stroke="${NAVY}" stroke-width="4"/>
<circle cx="250" cy="700" r="22" fill="${o.bg}" stroke="${NAVY}" stroke-width="4"/>
</svg>`;
}

/** Inline step image (1200x800). */
export function stepSvg(o: { bg: string; accent: string; motif: string; step: number }): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<rect width="1200" height="800" fill="${o.bg}"/>
<circle cx="140" cy="140" r="70" fill="#F26B1D" stroke="${NAVY}" stroke-width="5"/>
<text x="140" y="168" text-anchor="middle" font-family="Arial Black, Arial" font-size="80" font-weight="900" fill="#fff">${o.step}</text>
<rect x="420" y="160" width="440" height="500" rx="10" fill="#fff" stroke="${NAVY}" stroke-width="5" stroke-dasharray="${o.step === 1 ? "18 12" : "0"}"/>
${motif(o.motif, 640, 410, 150 + o.step * 10, o.step === 1 ? "#fff" : o.accent)}
</svg>`;
}

/** Printable preview (letter page). */
export function printablePreviewSvg(o: { title: string; motif: string; accent: string }): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="1100" viewBox="0 0 850 1100">
<rect width="850" height="1100" fill="#fff"/>
<rect x="40" y="40" width="770" height="1020" fill="none" stroke="${NAVY}" stroke-width="4" stroke-dasharray="16 10"/>
<text x="425" y="130" text-anchor="middle" font-family="Arial Black, Arial" font-size="44" font-weight="900" fill="${NAVY}">${esc(o.title.slice(0, 28))}</text>
${motif(o.motif, 270, 420, 150, "#fff")}
${motif(o.motif, 600, 420, 120, o.accent)}
${motif(o.motif, 270, 800, 110, o.accent)}
${motif(o.motif, 600, 800, 150, "#fff")}
</svg>`;
}

/** Hero cut-out: hands holding a finished paper pinwheel + pumpkin (transparent bg). */
export function heroSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
<g stroke="${NAVY}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<rect x="250" y="170" width="400" height="470" rx="14" fill="#fff" transform="rotate(-5 450 405)"/>
${motif("pumpkin", 450, 400, 150, "#F26B1D")}
<path d="M130 900 C 150 760, 190 680, 260 610 C 300 575, 350 600, 330 650 L 300 720" fill="#F7C9A5"/>
<path d="M235 640 C 260 600, 300 590, 320 610" fill="none"/>
<path d="M770 900 C 750 760, 710 680, 640 610 C 600 575, 550 600, 570 650 L 600 720" fill="#E9A97E"/>
<path d="M130 900 L 120 880 C 140 800, 160 760, 200 720" fill="none"/>
<rect x="120" y="820" width="180" height="80" fill="#14998A"/>
<rect x="600" y="820" width="180" height="80" fill="#14998A"/>
</g>
<g stroke="${NAVY}" stroke-width="4">${motif("star", 720, 170, 50, "#FFD84D")}${motif("heart", 170, 230, 45, "#FBD9E5")}</g>
</svg>`;
}

/** Author portrait illustration (4:5). */
export function authorSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
<rect width="800" height="1000" fill="#FFF1C1"/>${confetti(800, 500, 42)}
<g stroke="${NAVY}" stroke-width="7" stroke-linejoin="round">
<path d="M140 1000 C 160 760, 260 680, 400 680 C 540 680, 640 760, 660 1000 Z" fill="#14998A"/>
<rect x="355" y="600" width="90" height="110" fill="#E9A97E"/>
<path d="M230 420 C 210 250, 300 190, 400 190 C 500 190, 590 250, 570 420 C 600 600, 520 640, 400 640 C 280 640, 200 600, 230 420 Z" fill="#6B3E2E"/>
<ellipse cx="400" cy="440" rx="140" ry="165" fill="#F2B98E"/>
<path d="M265 360 C 300 280, 420 260, 540 330 C 500 250, 300 240, 265 360 Z" fill="#6B3E2E"/>
<circle cx="350" cy="440" r="12" fill="${NAVY}"/><circle cx="450" cy="440" r="12" fill="${NAVY}"/>
<path d="M350 520 C 380 550, 420 550, 450 520" fill="none" stroke-linecap="round"/>
<circle cx="320" cy="490" r="20" fill="#FBD9E5" stroke="none"/><circle cx="480" cy="490" r="20" fill="#FBD9E5" stroke="none"/>
<path d="M300 760 L 400 840 L 500 760" fill="none"/>
</g>
<g stroke="${NAVY}" stroke-width="5">${motif("star", 640, 820, 55, "#F26B1D")}</g>
</svg>`;
}

/** Minimal valid one-page PDF (Helvetica text + a few shapes). */
export function makePdf(title: string, lines: string[]): Buffer {
  const pdfEsc = (s: string) => s.replace(/[\\()]/g, (m) => `\\${m}`).replace(/[^\x20-\x7E]/g, "");
  const textOps = [
    "BT /F1 26 Tf 60 720 Td (" + pdfEsc(title) + ") Tj ET",
    ...lines.map((l, i) => `BT /F1 13 Tf 60 ${680 - i * 22} Td (${pdfEsc(l)}) Tj ET`),
  ];
  const shapes = [
    "4 w 0.12 0.16 0.27 RG",
    "[12 8] 0 d 40 40 532 712 re S [] 0 d",
    "0.95 0.42 0.11 rg 90 140 160 160 re f",
    "0.08 0.6 0.54 rg 320 140 200 200 re f",
    "1 0.85 0.3 rg 200 380 180 120 re f",
  ];
  const content = [...shapes, ...textOps].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((n) => `${String(n).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "binary");
}
