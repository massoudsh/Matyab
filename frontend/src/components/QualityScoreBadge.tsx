const GRADE_STYLE: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-rose-100 text-rose-800",
};

export function QualityScoreBadge({ grade, score }: { grade: "A" | "B" | "C"; score: number }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${GRADE_STYLE[grade]}`}>
      رده {grade} · {score} امتیاز
    </span>
  );
}
