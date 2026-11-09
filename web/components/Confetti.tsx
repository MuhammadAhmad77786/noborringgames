/** Decorative confetti shapes for the hero. Hidden on mobile via CSS. */
const SHAPES: { kind: "dot" | "plus" | "diamond" | "tri"; color: string; top: string; left: string; size: number; rot?: number }[] = [
  { kind: "dot", color: "#F26B1D", top: "8%", left: "3%", size: 14 },
  { kind: "plus", color: "#14998A", top: "18%", left: "46%", size: 20 },
  { kind: "diamond", color: "#FBD9E5", top: "70%", left: "2%", size: 22, rot: 12 },
  { kind: "tri", color: "#FFD84D", top: "84%", left: "40%", size: 22, rot: -10 },
  { kind: "dot", color: "#14998A", top: "6%", left: "88%", size: 12 },
  { kind: "plus", color: "#F26B1D", top: "88%", left: "92%", size: 18 },
  { kind: "diamond", color: "#FFD84D", top: "94%", left: "60%", size: 16 },
  { kind: "tri", color: "#FBD9E5", top: "12%", left: "64%", size: 18, rot: 20 },
  { kind: "dot", color: "#FBD9E5", top: "58%", left: "96%", size: 16 },
];

function Shape({ kind, color, size }: { kind: string; color: string; size: number }) {
  const stroke = { stroke: "#1F2A44", strokeWidth: 1.5, strokeLinejoin: "round" as const };
  switch (kind) {
    case "dot":
      return <circle cx="12" cy="12" r="9" fill={color} {...stroke} />;
    case "plus":
      return <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill={color} {...stroke} />;
    case "diamond":
      return <path d="M12 1 23 12 12 23 1 12Z" fill={color} {...stroke} />;
    default:
      return <path d="M12 2 22 21H2Z" fill={color} {...stroke} />;
  }
  void size;
}

export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {SHAPES.map((s, i) => (
        <svg
          key={i}
          width={s.size}
          height={s.size}
          viewBox="0 0 24 24"
          style={{ top: s.top, left: s.left, transform: s.rot ? `rotate(${s.rot}deg)` : undefined }}
        >
          <Shape kind={s.kind} color={s.color} size={s.size} />
        </svg>
      ))}
    </div>
  );
}
