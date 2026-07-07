import { cn } from "@/lib/utils";

export type ChartDatum = {
  label: string;
  value: number;
  color?: string;
};

const palette = ["#F59E0B", "#0EA5E9", "#10B981", "#8B5CF6", "#EF4444", "#64748B"];

function formatLabel(label: string) {
  return label.replaceAll("_", " ").toLowerCase();
}

function totalValue(data: ChartDatum[]) {
  return data.reduce((sum, item) => sum + Math.max(0, Number(item.value) || 0), 0);
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: ChartDatum[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = totalValue(data);
  const chartData = total > 0 ? data : [{ label: "No data", value: 1, color: "#CBD5E1" }];
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
      <div className="relative mx-auto h-44 w-44">
        <svg className="h-full w-full" viewBox="0 0 120 120" role="img" aria-label={centerLabel}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="14" />
          {chartData.map((item, index) => {
            const length = (Math.max(0, item.value) / totalValue(chartData)) * circumference;
            const segment = (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color ?? palette[index % palette.length]}
                strokeWidth="14"
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap={total > 0 ? "round" : "butt"}
                transform="rotate(-90 60 60)"
              />
            );
            offset += length;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-slate-950">{centerValue}</span>
          <span className="mt-1 text-xs font-medium uppercase text-slate-400">{centerLabel}</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.length ? data.map((item, index) => {
          const percent = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color ?? palette[index % palette.length] }}
                />
                <span className="truncate capitalize">{formatLabel(item.label)}</span>
              </span>
              <span className="text-sm font-semibold text-slate-900">{item.value} <span className="text-xs text-slate-400">{percent}%</span></span>
            </div>
          );
        }) : (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">No operational mix yet.</p>
        )}
      </div>
    </div>
  );
}

export function BarListChart({ data }: { data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="space-y-4">
      {data.length ? data.map((item, index) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-slate-600">{formatLabel(item.label)}</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(6, (item.value / max) * 100)}%`,
                backgroundColor: item.color ?? palette[index % palette.length],
              }}
            />
          </div>
        </div>
      )) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          No priority spread yet.
        </div>
      )}
    </div>
  );
}

export function AreaChart({ data }: { data: ChartDatum[] }) {
  const chartData = data.length
    ? data
    : [
        { label: "M-5", value: 0 },
        { label: "M-4", value: 0 },
        { label: "M-3", value: 0 },
        { label: "M-2", value: 0 },
        { label: "M-1", value: 0 },
        { label: "Now", value: 0 },
      ];
  const max = Math.max(1, ...chartData.map((item) => item.value));
  const width = 420;
  const height = 150;
  const padX = 16;
  const padY = 18;
  const step = (width - padX * 2) / Math.max(1, chartData.length - 1);
  const points = chartData.map((item, index) => {
    const x = padX + index * step;
    const y = height - padY - (item.value / max) * (height - padY * 2);
    return { x, y, item };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${width - padX},${height - padY}`;
  const hasData = data.some((item) => item.value > 0);

  return (
    <div>
      <svg className="h-44 w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Revenue trend">
        <defs>
          <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((lineIndex) => (
          <line
            key={lineIndex}
            x1={padX}
            x2={width - padX}
            y1={padY + lineIndex * 52}
            y2={padY + lineIndex * 52}
            stroke="#E2E8F0"
            strokeDasharray="4 5"
          />
        ))}
        <polygon points={area} fill="url(#revenue-area)" />
        <polyline
          points={line}
          fill="none"
          stroke={hasData ? "#F59E0B" : "#94A3B8"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <circle key={point.item.label} cx={point.x} cy={point.y} r="4.5" fill={hasData ? "#F59E0B" : "#94A3B8"} />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400 sm:grid-cols-6">
        {chartData.slice(-6).map((item) => (
          <span key={item.label} className="truncate">{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export function ScoreRing({
  value,
  label,
  tone = "amber",
}: {
  value: number;
  label: string;
  tone?: "amber" | "emerald" | "sky" | "rose";
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const colorByTone = {
    amber: "#F59E0B",
    emerald: "#10B981",
    sky: "#0EA5E9",
    rose: "#EF4444",
  };
  const circumference = 2 * Math.PI * 34;

  return (
    <div className="flex items-center gap-4">
      <svg className="h-24 w-24" viewBox="0 0 90 90" role="img" aria-label={label}>
        <circle cx="45" cy="45" r="34" fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="45"
          cy="45"
          r="34"
          fill="none"
          stroke={colorByTone[tone]}
          strokeWidth="10"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="49" textAnchor="middle" className="fill-slate-950 text-lg font-black">
          {clamped}%
        </text>
      </svg>
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">Calculated from live risk and work-order signals.</p>
      </div>
    </div>
  );
}

export function MiniSparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const chartValues = values.length ? values : [0, 2, 1, 3, 2, 4];
  const max = Math.max(1, ...chartValues);
  const points = chartValues.map((value, index) => {
    const x = (index / Math.max(1, chartValues.length - 1)) * 100;
    const y = 32 - (value / max) * 28;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className={cn("h-10 w-28", className)} viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
