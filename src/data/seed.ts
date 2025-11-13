import type { AptRow, Payment, BudgetVersion, Contract } from "@/types";

export const DEMO: AptRow[] = [
  { apt_id:"A601", type:"home", area_m2:92, ideal_parts_pct:1.32, has_garage:false, pin:"1601",
    base_common:18, elevator:7, cleaning:6, security:8, fund_repair:12, garage_clean:0, garage_light:0, misc:2 },
  { apt_id:"AP501", type:"home", area_m2:88, ideal_parts_pct:1.28, has_garage:true, pin:"2501",
    base_common:18, elevator:7, cleaning:6, security:8, fund_repair:12, garage_clean:3, garage_light:2, misc:2 },
  { apt_id:"A401", type:"home", area_m2:88, ideal_parts_pct:1.28, has_garage:true, pin:"1401",
    base_common:18, elevator:7, cleaning:6, security:8, fund_repair:12, garage_clean:3, garage_light:2, misc:2 },
  { apt_id:"B203", type:"office", area_m2:60, ideal_parts_pct:0.91, has_garage:false, pin:"2203",
    base_common:18, elevator:7, cleaning:6, security:8, fund_repair:12, garage_clean:0, garage_light:0, misc:2 },
];

export const PAYMENTS_EXAMPLE: Payment[] = [
  { id:"p1", apt_id:"A601", period:"2025-Q4", amount:159.00, date:"2025-11-12", note:"Внесено в брой" },
  { id:"p2", apt_id:"AP501", period:"2025-Q4", amount:174.00, date:"2025-11-12" },
];

export const BUDGETS_EXAMPLE: BudgetVersion[] = [{
  id:"b2026",
  title:"Бюджет 2026 (планиран)",
  effectiveFrom:"2026-01-01",
  status:"planned",
  items:[
    { code:"base_common", label:"Общи части", home:18 },
    { code:"elevator", label:"Асансьор", home:7 },
    { code:"cleaning", label:"Почистване", home:6 },
    { code:"security", label:"Охрана/Достъп", home:8 },
    { code:"garage_clean", label:"Гараж (почиств.)", home:3 },
    { code:"garage_light", label:"Гараж (осветл.)", home:2 },
    { code:"misc", label:"Други", home:2 },
    { code:"fund_repair", label:"Фонд ремонт/обновяване", home:12 },
  ],
}];

export const CONTRACTS_EXAMPLE: Contract[] = [
  { id:"c1", vendor:"CleanCo",  service:"Почистване",     startDate:"2025-07-01", monthlyCost:320 },
  { id:"c2", vendor:"SecurePro", service:"Контрол достъп", startDate:"2025-09-01", monthlyCost:280 },
];

// localStorage ключове
export const LS = {
  DATA: "psofia.v01.data",
  AUTH: "psofia.v01.auth",
  PAY:  "psofia.v01.payments",
  BUDG: "psofia.v01.budgets",
  CONTR:"psofia.v01.contracts",
};

// фонд по подразбиране
export const FUND_2026 = 12;
