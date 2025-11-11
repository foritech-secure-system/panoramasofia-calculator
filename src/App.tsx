import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Download, Upload, LogOut } from "lucide-react";

/**
 * Панорама София — калкулатор такси (v0.1)
 * -------------------------------------------------
 * Цел: Лесна страница за собствениците — логваш се с № на апартамент + PIN,
 * виждаш крайна сума по тримесечие и можеш да разгледаш детайлите "за какво плащаш".
 * Има два режима на изчисление: A) класически (по ИЧ) и B) "присъщи разходи".
 * Данните са примерни и се държат в паметта (може да бъдат импортирани от CSV).
 * По-късно ще добавим FPQCX509 и онлайн присъствие за ОС.
 */

// Типове
export type AptType = "home" | "office";

export interface AptRow {
  apt_id: string;         // A601, AP501, A401 ...
  type: AptType;          // "home" | "office"
  area_m2: number;        // m²
  ideal_parts_pct: number;// Идеални части (%)
  has_garage: boolean;    // има/няма гараж
  pin: string;            // PIN за достъп (примерно 4 цифри)

  // Месечни пера (лв)
  base_common: number;    // Общи части (осветление и т.н.)
  elevator: number;       // Асансьор
  cleaning: number;       // Почистване стълбище
  security: number;       // Охрана/контрол достъп
  fund_repair: number;    // Фонд ремонт и обновяване (прието: 12 лв/имот)
  garage_clean: number;   // Почистване гараж (ако има гараж)
  garage_light: number;   // Осветление гараж (ако има гараж)
  misc: number;           // Други
}

// Демоданни — включват твоите примери (A601 без гараж; AP501 и A401 с гараж)
const DEMO: AptRow[] = [
  {
    apt_id: "A601", type: "home", area_m2: 92, ideal_parts_pct: 1.32, has_garage: false, pin: "1601",
    base_common: 18, elevator: 7, cleaning: 6, security: 8, fund_repair: 12, garage_clean: 0, garage_light: 0, misc: 2,
  },
  {
    apt_id: "AP501", type: "home", area_m2: 88, ideal_parts_pct: 1.28, has_garage: true, pin: "2501",
    base_common: 18, elevator: 7, cleaning: 6, security: 8, fund_repair: 12, garage_clean: 3, garage_light: 2, misc: 2,
  },
  {
    apt_id: "A401", type: "home", area_m2: 88, ideal_parts_pct: 1.28, has_garage: true, pin: "1401",
    base_common: 18, elevator: 7, cleaning: 6, security: 8, fund_repair: 12, garage_clean: 3, garage_light: 2, misc: 2,
  },
  {
    apt_id: "B203", type: "office", area_m2: 60, ideal_parts_pct: 0.91, has_garage: false, pin: "2203",
    base_common: 18, elevator: 7, cleaning: 6, security: 8, fund_repair: 12, garage_clean: 0, garage_light: 0, misc: 2,
  },
];

// Настройки
const FUND_2026 = 12; // приет фонд ремонт/обновяване (лв/имот)

// Прост хеш за локално съхранение
const LS_KEY = "psofia.v01.data";
const LS_AUTH = "psofia.v01.auth";

function useAptData() {
  const [rows, setRows] = useState<AptRow[]>(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEMO;
    try { return JSON.parse(raw) as AptRow[]; } catch { return DEMO; }
  });
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(rows)); }, [rows]);
  return { rows, setRows };
}

function useAuth() {
  const [aptId, setAptId] = useState<string | null>(() => {
    const raw = localStorage.getItem(LS_AUTH);
    return raw || null;
  });
  const login = (id: string) => { setAptId(id); localStorage.setItem(LS_AUTH, id); };
  const logout = () => { setAptId(null); localStorage.removeItem(LS_AUTH); };
  return { aptId, login, logout };
}

// Калкулации
type Mode = "A_classic" | "B_prisyshti";

function calcMonthly(row: AptRow, mode: Mode): number {
  // Винаги актуализираме фонда към 12 лв (приет за 2026)
  const fund = FUND_2026;
  const base = row.base_common + row.elevator + row.cleaning + row.security + row.misc;
  const garage = row.has_garage ? (row.garage_clean + row.garage_light) : 0;

  if (mode === "A_classic") {
    // Класически — всички пера се прилагат еднакво (ако има гараж — добавяме гаражните пера)
    return base + fund + garage;
  } else {
    // B) "Присъщи разходи": офисите не плащат пера, които не ползват (примерна логика)
    const isOffice = row.type === "office";
    const officeFactor = 0.85; // може да се направи по-перно, напр. асансьор 1.0, почистване 0.8 и т.н.

    const baseAdj = isOffice ? (row.base_common + row.security + row.misc) * officeFactor + row.elevator : (row.base_common + row.elevator + row.cleaning + row.security + row.misc);
    const garageAdj = row.has_garage ? (row.garage_clean + row.garage_light) : 0;
    return baseAdj + fund + garageAdj;
  }
}

function money(x: number) { return new Intl.NumberFormat('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x); }

// Импорт от CSV
function parseCSV(text: string): AptRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  if (!header) return DEMO;
  const cols = header.split(",").map(s => s.trim());
  const idx = (name: string) => cols.findIndex(c => c.toLowerCase() === name.toLowerCase());

  const req = ["apt_id","type","area_m2","ideal_parts_pct","has_garage","pin","base_common","elevator","cleaning","security","fund_repair","garage_clean","garage_light","misc"];
  const missing = req.filter(r => idx(r) === -1);
  if (missing.length) throw new Error("Липсват колони: " + missing.join(", "));

  const rows: AptRow[] = [];
  for (const line of lines) {
    const parts = line.split(",").map(s => s.trim());
    if (parts.length !== cols.length) continue;
    const row: AptRow = {
      apt_id: parts[idx("apt_id")],
      type: (parts[idx("type")] as AptType) || "home",
      area_m2: Number(parts[idx("area_m2")] || 0),
      ideal_parts_pct: Number(parts[idx("ideal_parts_pct")] || 0),
      has_garage: /^(1|да|true|yes)$/i.test(parts[idx("has_garage")]),
      pin: parts[idx("pin")] || "0000",
      base_common: Number(parts[idx("base_common")] || 0),
      elevator: Number(parts[idx("elevator")] || 0),
      cleaning: Number(parts[idx("cleaning")] || 0),
      security: Number(parts[idx("security")] || 0),
      fund_repair: Number(parts[idx("fund_repair")] || FUND_2026),
      garage_clean: Number(parts[idx("garage_clean")] || 0),
      garage_light: Number(parts[idx("garage_light")] || 0),
      misc: Number(parts[idx("misc")] || 0),
    };
    rows.push(row);
  }
  return rows;
}

export default function App() {
  const { rows, setRows } = useAptData();
  const { aptId, login, logout } = useAuth();
  const [mode, setMode] = useState<Mode>("A_classic");
  const [quarter, setQuarter] = useState<1|2|3|4>(1);
  const [adminOpen, setAdminOpen] = useState(false);

  const apt = useMemo(() => rows.find(r => r.apt_id.toLowerCase() === (aptId||"").toLowerCase()) || null, [rows, aptId]);

  const [loginForm, setLoginForm] = useState({ apt: "", pin: "" });

  const doLogin = () => {
    const r = rows.find(x => x.apt_id.toLowerCase() === loginForm.apt.trim().toLowerCase());
    if (!r) { alert("Няма такъв апартамент"); return; }
    if (r.pin !== loginForm.pin.trim()) { alert("Грешен PIN"); return; }
    login(r.apt_id);
  };

  const qMult = useMemo(() => 3, []); // тримесечие = 3 месеца
  const monthly = useMemo(() => apt ? calcMonthly(apt, mode) : 0, [apt, mode]);
  const due = useMemo(() => monthly * qMult, [monthly, qMult]);

  const downloadCSV = () => {
    const header = ["apt_id","type","area_m2","ideal_parts_pct","has_garage","pin","base_common","elevator","cleaning","security","fund_repair","garage_clean","garage_light","misc"];    
    const lines = [header.join(",")];
    rows.forEach(r => {
      lines.push([
        r.apt_id, r.type, r.area_m2, r.ideal_parts_pct, r.has_garage ? 1 : 0, r.pin,
        r.base_common, r.elevator, r.cleaning, r.security, r.fund_repair, r.garage_clean, r.garage_light, r.misc,
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "panorama_sofia_data.csv"; a.click();
  };

  const onCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const txt = String(reader.result || "");
        const parsed = parseCSV(txt);
        setRows(parsed);
        alert("Импортът е успешен: " + parsed.length + " записа");
      } catch (err: any) {
        alert("Грешка при импорт: " + err.message);
      }
    };
    reader.readAsText(f);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto grid gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Панорама София — калкулатор такси (v0.1)</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setAdminOpen(true)}>Админ / Импорт</Button>
            {apt ? (
              <Button variant="outline" onClick={logout}><LogOut className="w-4 h-4 mr-1"/>Изход ({apt.apt_id})</Button>
            ) : null}
          </div>
        </div>

        {/* Login / App switch */}
        {!apt ? (
          <Card className="shadow-sm">
            <CardContent className="p-6 grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>№ Апартамент</Label>
                  <Input placeholder="напр. A601" value={loginForm.apt} onChange={e=>setLoginForm(v=>({...v, apt: e.target.value}))}/>
                </div>
                <div>
                  <Label>PIN</Label>
                  <Input type="password" placeholder="****" value={loginForm.pin} onChange={e=>setLoginForm(v=>({...v, pin: e.target.value}))}/>
                </div>
                <div className="flex items-end"><Button className="w-full" onClick={doLogin}>Вход</Button></div>
              </div>
              <p className="text-sm text-gray-600">Достъп само за собственици. Данните са за преглед и ще бъдат потвърдени на ОС.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-sm">
              <CardContent className="p-6 grid gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Режим</Label>
                    <Tabs value={mode} onValueChange={(v)=>setMode(v as Mode)}>
                      <TabsList>
                        <TabsTrigger value="A_classic">A: Класически</TabsTrigger>
                        <TabsTrigger value="B_prisyshti">B: Присъщи</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Тримесечие</Label>
                    <select className="border rounded px-3 py-2" value={quarter} onChange={(e)=>setQuarter(Number(e.target.value) as any)}>
                      <option value={1}>I</option>
                      <option value={2}>II</option>
                      <option value={3}>III</option>
                      <option value={4}>IV</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h2 className="font-semibold mb-2">{apt.apt_id} — Обобщение</h2>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Показател</TableHead>
                          <TableHead>Стойност</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow><TableCell>Тип</TableCell><TableCell>{apt.type === "office" ? "Офис" : "Жилище"}</TableCell></TableRow>
                        <TableRow><TableCell>Площ (м²)</TableCell><TableCell>{apt.area_m2}</TableCell></TableRow>
                        <TableRow><TableCell>Идеални части (%)</TableCell><TableCell>{apt.ideal_parts_pct}</TableCell></TableRow>
                        <TableRow><TableCell>Гараж</TableCell><TableCell>{apt.has_garage ? "Да" : "Не"}</TableCell></TableRow>
                        <TableRow><TableCell>Месечна сума ({mode === 'A_classic' ? 'класически' : 'присъщи'})</TableCell><TableCell><b>{money(calcMonthly(apt, mode))} лв</b></TableCell></TableRow>
                        <TableRow><TableCell>За тримесечие ×3</TableCell><TableCell><b className="text-lg">{money(calcMonthly(apt, mode) * 3)} лв</b></TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="font-semibold mb-2">Къде отиват парите</h3>
                    <ul className="text-sm space-y-1">
                      <li>Общи части (осветление, ток стълби) — {money(apt.base_common)} лв</li>
                      <li>Асансьор — {money(apt.elevator)} лв</li>
                      <li>Почистване — {money(apt.cleaning)} лв</li>
                      <li>Охрана/Достъп — {money(apt.security)} лв</li>
                      {apt.has_garage && <li>Гаражи (почистване) — {money(apt.garage_clean)} лв</li>}
                      {apt.has_garage && <li>Гаражи (осветление) — {money(apt.garage_light)} лв</li>}
                      <li>Други — {money(apt.misc)} лв</li>
                      <li><b>Фонд ремонт и обновяване — {money(FUND_2026)} лв</b></li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">* Режим „Присъщи“ намалява част от перата за офиси.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Списък с всички апартаменти (само метаданни + търсене) */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-3">Списък на апартаменти</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ап.</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>м²</TableHead>
                      <TableHead>ИЧ %</TableHead>
                      <TableHead>Гараж</TableHead>
                      <TableHead>Месец (A)</TableHead>
                      <TableHead>Месец (B)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(r => (
                      <TableRow key={r.apt_id} className={r.apt_id === apt.apt_id ? "bg-gray-100" : ""}>
                        <TableCell>{r.apt_id}</TableCell>
                        <TableCell>{r.type === "office" ? "Офис" : "Жилище"}</TableCell>
                        <TableCell>{r.area_m2}</TableCell>
                        <TableCell>{r.ideal_parts_pct}</TableCell>
                        <TableCell>{r.has_garage ? "Да" : "Не"}</TableCell>
                        <TableCell>{money(calcMonthly(r, "A_classic"))}</TableCell>
                        <TableCell>{money(calcMonthly(r, "B_prisyshti"))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Админ диалог: импорт/експорт, смяна на PIN, добавяне на ап. */}
        <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Админ панел</DialogTitle>
              <DialogDescription>Импорт/експорт на данни и бързи настройки.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={downloadCSV}><Download className="w-4 h-4 mr-1"/>Експорт CSV</Button>
                <Label className="cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4"/> Импорт CSV
                  <Input type="file" accept=".csv" className="hidden" onChange={onCSVUpload} />
                </Label>
              </div>

              <div className="border rounded-xl p-4">
                <h4 className="font-semibold mb-2">Примерен формат на CSV</h4>
                <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded">
{`apt_id,type,area_m2,ideal_parts_pct,has_garage,pin,base_common,elevator,cleaning,security,fund_repair,garage_clean,garage_light,misc
A601,home,92,1.32,0,1601,18,7,6,8,12,0,0,2
AP501,home,88,1.28,1,2501,18,7,6,8,12,3,2,2
A401,home,88,1.28,1,1401,18,7,6,8,12,3,2,2
B203,office,60,0.91,0,2203,18,7,6,8,12,0,0,2`}
                </pre>
                <p className="text-xs text-gray-600">* По-късно ще добавим импорт от Excel и интеграция с вашите таблици.</p>
              </div>

              <div className="text-xs text-gray-500">Планирано: защита с акаунти/пароли за всеки ап., журнал на плащанията, бележки за ОС, FPQCX509 вход.</div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
