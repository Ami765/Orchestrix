/**
 * Generate a unique ID with a customized prefix.
 */
export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Basic throttle utility for performance.
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle = false;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

/**
 * Returns risk badges styling based on risk rating value.
 */
export function getRiskRatingBadgeStyle(rating: string): { border: string; text: string; bg: string } {
  const normalized = (rating || "").toLowerCase();
  switch (normalized) {
    case "high":
      return {
        border: "border-red-500/20",
        text: "text-red-400",
        bg: "bg-red-500/10",
      };
    case "moderate":
    case "medium":
      return {
        border: "border-amber-500/20",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
      };
    case "low":
    default:
      return {
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
      };
  }
}
