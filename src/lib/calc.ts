import type { AptRow, Mode } from "@/types";
import { FUND_2026 } from "@/data/seed";

export function calcMonthly(row: AptRow, mode: Mode): number {
  const base = row.base_common + row.elevator + row.cleaning + row.security + row.misc;
  const garage = row.has_garage ? (row.garage_clean + row.garage_light) : 0;
  if (mode === "A_classic") return base + FUND_2026 + garage;

  const isOffice = row.type === "office";
  const officeFactor = 0.85;
  const baseAdj = isOffice
    ? (row.base_common + row.security + row.misc) * officeFactor + row.elevator
    : (row.base_common + row.elevator + row.cleaning + row.security + row.misc);
  return baseAdj + FUND_2026 + garage;
}

export function money(x: number) {
  return new Intl.NumberFormat("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
}
