export type AptType = "home" | "office";

export interface AptRow {
  apt_id: string;
  type: AptType;
  area_m2: number;
  ideal_parts_pct: number;
  has_garage: boolean;
  pin: string;
  base_common: number;
  elevator: number;
  cleaning: number;
  security: number;
  fund_repair: number;
  garage_clean: number;
  garage_light: number;
  misc: number;
}

export interface Payment {
  id: string;
  apt_id: string;
  period: string;
  amount: number;
  date: string;
  note?: string;
}

export interface BudgetItem { code: string; label: string; home: number; office?: number; }
export interface BudgetVersion { id: string; title: string; effectiveFrom: string; items: BudgetItem[]; status: "active"|"planned"|"archived"; }
export interface Contract { id: string; vendor: string; service: string; startDate: string; endDate?: string; monthlyCost: number; docUrl?: string; }

export type Mode = "A_classic" | "B_prisyshti";
export type PageTab = "dashboard" | "apartments" | "budget" | "contracts" | "history";
