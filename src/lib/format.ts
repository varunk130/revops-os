export const pct = (x: number, dp = 0): string => `${(x * 100).toFixed(dp)}%`;
export const signedPct = (x: number, dp = 0): string => `${x >= 0 ? "+" : ""}${(x * 100).toFixed(dp)}%`;
export const usd = (x: number): string => `$${Math.round(x).toLocaleString("en-US")}`;
export const num = (x: number): string => Math.round(x).toLocaleString("en-US");

export const usdK = (x: number): string => {
  if (Math.abs(x) >= 1000) return `$${(x / 1000).toFixed(x % 1000 === 0 ? 0 : 1)}k`;
  return `$${Math.round(x)}`;
};

export const usdM = (x: number): string => {
  if (Math.abs(x) >= 1_000_000) return `$${(x / 1_000_000).toFixed(2)}M`;
  if (Math.abs(x) >= 1000) return `$${(x / 1000).toFixed(0)}k`;
  return `$${Math.round(x)}`;
};

export const compact = (x: number): string => {
  if (Math.abs(x) >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`;
  if (Math.abs(x) >= 1000) return `${(x / 1000).toFixed(1)}k`;
  return `${Math.round(x)}`;
};
