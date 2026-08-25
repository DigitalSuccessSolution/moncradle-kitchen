"use client";

interface BatchProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export default function BatchProgressRing({
  percent,
  size = 72,
  strokeWidth = 6,
}: BatchProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const colorClass =
    percent >= 90
      ? "stroke-emerald-600"
      : percent >= 50
      ? "stroke-brand"
      : "stroke-amber-500";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-slate-200 fill-none"
          style={{ strokeWidth }}
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`${colorClass} fill-none transition-all duration-1000 ease-out`}
          style={{ strokeWidth }}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-800">
        {percent}%
      </span>
    </div>
  );
}
