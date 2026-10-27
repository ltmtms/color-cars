import { ROAD_PATHS, ROAD_VIEWBOX } from "@/lib/road-paths";

function pathD(points: { x: number; y: number }[]) {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
}

export function CartoonRoadMap() {
  return (
    <svg
      viewBox={`0 0 ${ROAD_VIEWBOX.w} ${ROAD_VIEWBOX.h}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8e8ff" />
          <stop offset="55%" stopColor="#dff6ff" />
          <stop offset="100%" stopColor="#c8f0c4" />
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a8e6a0" />
          <stop offset="100%" stopColor="#7ed67a" />
        </linearGradient>
      </defs>
      <rect width={ROAD_VIEWBOX.w} height={ROAD_VIEWBOX.h} fill="url(#sky)" />
      <ellipse cx="500" cy="520" rx="520" ry="120" fill="url(#grass)" />
      <ellipse cx="180" cy="180" rx="90" ry="55" fill="#8fd989" opacity="0.9" />
      <ellipse cx="820" cy="200" rx="100" ry="60" fill="#8fd989" opacity="0.9" />
      <ellipse cx="500" cy="130" rx="120" ry="70" fill="#9ae393" opacity="0.85" />

      {ROAD_PATHS.map((road) => (
        <g key={road.id}>
          <path
            d={pathD(road.points)}
            fill="none"
            stroke="#6b7280"
            strokeWidth={44}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathD(road.points)}
            fill="none"
            stroke="#fde68a"
            strokeWidth={4}
            strokeDasharray="16 20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      <circle cx="500" cy="280" r="36" fill="#86efac" stroke="#4ade80" strokeWidth={4} />
      <text x="500" y="288" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#166534">
        park
      </text>

      <g fill="#f472b6" opacity="0.85">
        <circle cx="220" cy="200" r="14" />
        <rect x="212" y="210" width="16" height="22" rx="4" fill="#22c55e" />
      </g>
      <g fill="#38bdf8" opacity="0.85">
        <circle cx="780" cy="360" r="14" />
        <rect x="772" y="370" width="16" height="22" rx="4" fill="#22c55e" />
      </g>
      <g fill="#fbbf24" opacity="0.85">
        <circle cx="650" cy="140" r="12" />
        <rect x="644" y="148" width="12" height="18" rx="3" fill="#22c55e" />
      </g>
    </svg>
  );
}
