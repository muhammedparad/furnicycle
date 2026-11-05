import type { Category } from "@/lib/types";

/** Flat drawings of each category, used where a listing has no photo yet. */

const GROUNDS = ["#fbefe0", "#f6e9dc", "#fdf1e2", "#f3e6d8", "#f8ecdf", "#efe4d7"];
const WOODS = ["#9a6440", "#7b4f33", "#b07a4c", "#6b4a35"];
const FABRICS = ["#3f5f7d", "#6c7f5b", "#8b4d3e", "#4a4a4a", "#b08a4a"];

function pick<T>(arr: T[], seed: number) {
  return arr[Math.abs(seed) % arr.length];
}

export function seedOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function Shape({ category, wood, fabric }: { category: Category; wood: string; fabric: string }) {
  const leg = { fill: wood };
  switch (category) {
    case "sofa":
      return (
        <g>
          <rect x="34" y="52" width="132" height="34" fill={fabric} />
          <rect x="24" y="70" width="22" height="40" fill={fabric} />
          <rect x="154" y="70" width="22" height="40" fill={fabric} />
          <rect x="42" y="84" width="116" height="22" fill={fabric} opacity="0.85" />
          <rect x="34" y="110" width="6" height="12" {...leg} />
          <rect x="160" y="110" width="6" height="12" {...leg} />
        </g>
      );
    case "bed":
      return (
        <g>
          <rect x="22" y="40" width="14" height="82" {...leg} />
          <rect x="22" y="40" width="40" height="44" {...leg} />
          <rect x="36" y="80" width="142" height="22" fill="#f6f3ee" />
          <rect x="60" y="72" width="118" height="14" fill={fabric} />
          <rect x="36" y="100" width="142" height="10" {...leg} />
          <rect x="170" y="100" width="8" height="22" {...leg} />
        </g>
      );
    case "dining":
      return (
        <g>
          <rect x="44" y="66" width="112" height="10" {...leg} />
          <rect x="52" y="76" width="7" height="46" {...leg} />
          <rect x="141" y="76" width="7" height="46" {...leg} />
          <rect x="18" y="56" width="6" height="66" fill={fabric} />
          <rect x="18" y="88" width="24" height="6" fill={fabric} />
          <rect x="36" y="94" width="5" height="28" fill={fabric} />
          <rect x="176" y="56" width="6" height="66" fill={fabric} />
          <rect x="158" y="88" width="24" height="6" fill={fabric} />
          <rect x="159" y="94" width="5" height="28" fill={fabric} />
        </g>
      );
    case "table":
      return (
        <g>
          <rect x="40" y="70" width="120" height="10" {...leg} />
          <rect x="50" y="80" width="8" height="42" {...leg} />
          <rect x="142" y="80" width="8" height="42" {...leg} />
          <rect x="58" y="104" width="84" height="5" fill={wood} opacity="0.7" />
        </g>
      );
    case "chair":
      return (
        <g>
          <rect x="74" y="30" width="8" height="92" {...leg} />
          <rect x="74" y="30" width="44" height="40" fill={fabric} />
          <rect x="74" y="78" width="56" height="10" {...leg} />
          <rect x="122" y="88" width="8" height="34" {...leg} />
          <rect x="80" y="74" width="50" height="6" fill={fabric} opacity="0.8" />
        </g>
      );
    case "wardrobe":
      return (
        <g>
          <rect x="56" y="18" width="88" height="104" {...leg} />
          <rect x="62" y="24" width="37" height="92" fill={wood} opacity="0.8" />
          <rect x="101" y="24" width="37" height="92" fill={wood} opacity="0.8" />
          <rect x="94" y="64" width="3" height="14" fill="#f6f3ee" />
          <rect x="103" y="64" width="3" height="14" fill="#f6f3ee" />
          <rect x="60" y="122" width="6" height="6" {...leg} />
          <rect x="134" y="122" width="6" height="6" {...leg} />
        </g>
      );
    case "shelf":
      return (
        <g>
          <rect x="60" y="20" width="8" height="106" {...leg} />
          <rect x="132" y="20" width="8" height="106" {...leg} />
          {[20, 46, 72, 98, 120].map((y) => (
            <rect key={y} x="60" y={y} width="80" height="6" {...leg} />
          ))}
          <rect x="72" y="30" width="8" height="16" fill={fabric} />
          <rect x="82" y="34" width="6" height="12" fill="#c9b48a" />
          <rect x="108" y="56" width="20" height="16" fill={fabric} opacity="0.7" />
          <rect x="74" y="84" width="10" height="14" fill="#c9b48a" />
        </g>
      );
    case "desk":
      return (
        <g>
          <rect x="30" y="64" width="140" height="9" {...leg} />
          <rect x="36" y="73" width="7" height="49" {...leg} />
          <rect x="120" y="73" width="44" height="49" fill={wood} opacity="0.85" />
          <rect x="138" y="84" width="10" height="3" fill="#f6f3ee" />
          <rect x="138" y="104" width="10" height="3" fill="#f6f3ee" />
          <rect x="64" y="38" width="40" height="26" fill="#2b2b2b" />
          <rect x="82" y="58" width="4" height="6" fill="#2b2b2b" />
        </g>
      );
    case "cabinet":
      return (
        <g>
          <rect x="50" y="48" width="100" height="70" {...leg} />
          <rect x="56" y="54" width="42" height="58" fill={wood} opacity="0.8" />
          <rect x="102" y="54" width="42" height="27" fill={wood} opacity="0.8" />
          <rect x="102" y="85" width="42" height="27" fill={wood} opacity="0.8" />
          <rect x="118" y="66" width="10" height="3" fill="#f6f3ee" />
          <rect x="118" y="97" width="10" height="3" fill="#f6f3ee" />
          <rect x="54" y="118" width="6" height="8" {...leg} />
          <rect x="140" y="118" width="6" height="8" {...leg} />
          <rect x="72" y="30" width="26" height="18" fill={fabric} opacity="0.6" />
        </g>
      );
    default:
      return (
        <g>
          <rect x="70" y="60" width="60" height="50" fill={fabric} />
          <rect x="62" y="108" width="76" height="10" {...leg} />
          <rect x="88" y="40" width="24" height="20" {...leg} />
        </g>
      );
  }
}

export function FurnitureArt({
  category,
  seed = 0,
  className,
  label,
}: {
  category: Category;
  seed?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 150"
      preserveAspectRatio="xMidYMax meet"
      className={className}
      style={{ backgroundColor: pick(GROUNDS, seed) }}
      role="img"
      aria-label={label ?? `Drawing of a ${category}`}
    >
      <rect width="200" height="150" fill={pick(GROUNDS, seed)} />
      <rect y="122" width="200" height="28" fill="#000" opacity="0.05" />
      <Shape category={category} wood={pick(WOODS, Math.floor(seed / 7))} fabric={pick(FABRICS, Math.floor(seed / 131))} />
    </svg>
  );
}
