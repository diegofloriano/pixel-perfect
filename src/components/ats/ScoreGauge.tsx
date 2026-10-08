export function ScoreGauge({ score, size = 140, label = "Score ATS" }: { score: number; size?: number; label?: string }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={12} className="fill-none stroke-highlight" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={`fill-none transition-all duration-700 ${score >= 75 ? "stroke-primary" : "stroke-highlight-strong"}`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl font-bold text-foreground">{score}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function MatchBadge({ score }: { score: number }) {
  const cls =
    score >= 75
      ? "bg-highlight text-highlight-foreground border-highlight-border"
      : score >= 50
        ? "bg-accent text-accent-foreground border-transparent"
        : "bg-muted text-muted-foreground border-transparent";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{score}% match</span>;
}
