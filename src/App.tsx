import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Download, Upload, LogOut } from "lucide-react";

import type { AptRow, Mode, PageTab, Payment } from "@/types";
import PaymentsDialog from "@/components/PaymentsDialog";
import { DEMO, PAYMENTS_EXAMPLE, BUDGETS_EXAMPLE, CONTRACTS_EXAMPLE, LS } from "@/data/seed";
import { calcMonthly, money } from "@/lib/calc";

function useAptData() {
  const [rows, setRows] = useState<AptRow[]>(() => {
    const raw = localStorage.getItem(LS.DATA);
    if (!raw) return DEMO;
    try { return JSON.parse(raw) as AptRow[]; } catch { return DEMO; }
  });
  useEffect(()=>localStorage.setItem(LS.DATA, JSON.stringify(rows)),[rows]);
  return { rows, setRows };
}
function useAuth() {
  const [aptId, setAptId] = useState<string | null>(() => localStorage.getItem(LS.AUTH));
  const login = (id: string)=>{ setAptId(id); localStorage.setItem(LS.AUTH, id); };
  const logout = ()=>{ setAptId(null); localStorage.removeItem(LS.AUTH); };
  return { aptId, login, logout };
}
function usePayments() {
  const [items, setItems] = useState<Payment[]>(() => {
    const raw = localStorage.getItem(LS.PAY);
    return raw ? JSON.parse(raw) : PAYMENTS_EXAMPLE;
  });
  useEffect(()=>localStorage.setItem(LS.PAY, JSON.stringify(items)),[items]);
  return { payments: items, setPayments: setItems };
}

export default function App() {
  const { rows, setRows } = useAptData();
  const { aptId, login, logout } = useAuth();
  const { payments, setPayments } = usePayments();

  const [mode, setMode] = useState<Mode>("A_classic");
  const [tab, setTab] = useState<PageTab>("dashboard");
  const [quarter, setQuarter] = useState<1|2|3|4>(1);
  const [adminOpen, setAdminOpen] = useState(false);
  const [payApt, setPayApt] = useState<string|null>(null);

  const apt = useMemo(()=>rows.find(r=>r.apt_id.toLowerCase()===(aptId||"").toLowerCase())||null,[rows,aptId]);
  const [loginForm, setLoginForm] = useState({apt:"", pin:""});

  const doLogin = () => {
    const r = rows.find(x => x.apt_id.toLowerCase() === loginForm.apt.trim().toLowerCase());
    if (!r) { alert("Няма такъв апартамент"); return; }
    if (r.pin !== loginForm.pin.trim()) { alert("Грешен PIN"); return; }
    login(r.apt_id);
  };

  const monthly = useMemo(()=>apt?calcMonthly(apt,mode):0,[apt,mode]);
  const qTotal  = monthly*3;

  const addPayment = (p: Payment)=>setPayments(prev=>[p,...prev]);

  // прост CSV експорт на апартаментите
  const exportCSV = () => {
    const header = ["apt_id","type","area_m2","ideal_parts_pct","has_garage","pin","base_common","elevator","cleaning","security","fund_repair","garage_clean","garage_light","misc"];
    const lines = [header.join(",")].concat(rows.map(r=>[
      r.apt_id,r.type,r.area_m2,r.ideal_parts_pct,r.has_garage?1:0,r.pin,
      r.base_common,r.elevator,r.cleaning,r.security,r.fund_repair,r.garage_clean,r.garage_light,r.misc
    ].join(",")));
    const blob = new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "panorama_sofia_data.csv"; a.click();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Панорама София — калкулатор такси</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={()=>setAdminOpen(!adminOpen)}>Админ / Импорт</Button>
            <Button variant="outline" disabled title="Планирано">Онлайн присъствие</Button>
            {apt && <Button variant="outline" onClick={logout}><LogOut className="w-4 h-4 mr-1"/>Изход ({apt.apt_id})</Button>}
          </div>
        </div>

        {/* Навигация след логин */}
        {apt && (
          <div className="mt-4">
            <Tabs value={tab} onValueChange={(v)=>setTab(v as PageTab)} className="w-full">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="dashboard">Табло</TabsTrigger>
                <TabsTrigger value="apartments">Апартаменти</TabsTrigger>
                <TabsTrigger value="budget">Бюджет</TabsTrigger>
                <TabsTrigger value="contracts">Договори</TabsTrigger>
                <TabsTrigger value="history">История</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Login / App */}
        {!apt ? (
          <Card className="shadow-sm mt-6">
            <CardContent className="p-6 grid gap-4">
              <h2 className="text-xl font-semibold">Вход за собственици</h2>
              <ol className="list-decimal pl-5 text-sm text-gray-600">
                <li>Въведете № на апартамента (напр. A601)</li>
                <li>Въведете PIN и натиснете „Вход“</li>
              </ol>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>№ Апартамент</Label><Input value={loginForm.apt} onChange={e=>setLoginForm(v=>({...v,apt:e.target.value}))} placeholder="A601"/></div>
                <div><Label>PIN</Label><Input type="password" value={loginForm.pin} onChange={e=>setLoginForm(v=>({...v,pin:e.target.value}))} placeholder="****"/></div>
                <div className="flex items-end"><Button className="w-full" onClick={doLogin}>Вход</Button></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6">
            {tab==="dashboard" && (
              <Card className="shadow-sm">
                <CardContent className="p-6 grid gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label>Режим</Label>
                      <Tabs value={mode} onValueChange={(v)=>setMode(v as Mode)}>
                        <TabsList><TabsTrigger value="A_classic">A: Класически</TabsTrigger><TabsTrigger value="B_prisyshti">B: Присъщи</TabsTrigger></TabsList>
                      </Tabs>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Тримесечие</Label>
                      <select className="border rounded px-3 py-2" value={quarter} onChange={e=>setQuarter(Number(e.target.value) as any)}>
                        <option value={1}>I</option><option value={2}>II</option><option value={3}>III</option><option value={4}>IV</option>
                      </select>
                    </div>
                    <div className="ml-auto"><Button variant="outline" onClick={()=>setPayApt(apt.apt_id)}>Плащания</Button></div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h2 className="font-semibold mb-2">{apt.apt_id} — Обобщение</h2>
                      <Table><TableHeader><TableRow><TableHead>Показател</TableHead><TableHead>Стойност</TableHead></TableRow></TableHeader>
                        <TableBody>
                          <TableRow><TableCell>Тип</TableCell><TableCell>{apt.type==="office"?"Офис":"Жилище"}</TableCell></TableRow>
                          <TableRow><TableCell>Площ (м²)</TableCell><TableCell>{apt.area_m2}</TableCell></TableRow>
                          <TableRow><TableCell>Идеални части (%)</TableCell><TableCell>{apt.ideal_parts_pct}</TableCell></TableRow>
                          <TableRow><TableCell>Гараж</TableCell><TableCell>{apt.has_garage ? "Да" : "Не"}</TableCell></TableRow>
                          <TableRow><TableCell>Месечна сума</TableCell><TableCell><b>{money(monthly)} лв</b></TableCell></TableRow>
                          <TableRow><TableCell>Тримесечие ×3</TableCell><TableCell><b className="text-lg">{money(qTotal)} лв</b></TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h3 className="font-semibold mb-2">Къде отиват парите</h3>
                      <ul className="text-sm space-y-1">
                        <li>Общи части — {money(apt.base_common)} лв</li>
                        <li>Асансьор — {money(apt.elevator)} лв</li>
                        <li>Почистване — {money(apt.cleaning)} лв</li>
                        <li>Охрана/Достъп — {money(apt.security)} лв</li>
                        {apt.has_garage && <li>Гаражи (почистване) — {money(apt.garage_clean)} лв</li>}
                        {apt.has_garage && <li>Гаражи (осветление) — {money(apt.garage_light)} лв</li>}
                        <li>Други — {money(apt.misc)} лв</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {tab==="apartments" && (
              <Card className="shadow-sm"><CardContent className="p-6">
                <h2 className="font-semibold mb-3">Всички апартаменти</h2>
                <Table><TableHeader><TableRow>
                  <TableHead>Ап.</TableHead><TableHead>Тип</TableHead><TableHead>м²</TableHead>
                  <TableHead>ИЧ %</TableHead><TableHead>Гараж</TableHead>
                  <TableHead>Месец (A)</TableHead><TableHead>Месец (B)</TableHead><TableHead>Плащания</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rows.map(r=>(
                    <TableRow key={r.apt_id}>
                      <TableCell>{r.apt_id}</TableCell>
                      <TableCell>{r.type==="office"?"Офис":"Жилище"}</TableCell>
                      <TableCell>{r.area_m2}</TableCell>
                      <TableCell>{r.ideal_parts_pct}</TableCell>
                      <TableCell>{r.has_garage?"Да":"Не"}</TableCell>
                      <TableCell>{money(calcMonthly(r,"A_classic"))}</TableCell>
                      <TableCell>{money(calcMonthly(r,"B_prisyshti"))}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={()=>setPayApt(r.apt_id)}>Плащания</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </CardContent></Card>
            )}
          </div>
        )}

        {/* Админ панел – просто експорт за сега */}
        {adminOpen && (
          <div className="mt-4 p-4 border rounded-xl bg-white flex items-center gap-3">
            <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-1"/>Експорт CSV</Button>
            <label className="text-sm text-gray-500 flex items-center gap-2"><Upload className="w-4 h-4"/> Импорт (скоро)</label>
          </div>
        )}

        <PaymentsDialog aptId={payApt} payments={payments} onClose={()=>setPayApt(null)} onAdd={addPayment}/>
      </div>
    </main>
  );
}
