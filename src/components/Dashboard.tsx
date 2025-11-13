import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { money, calcMonthly } from "@/lib/calc";
import { FUND_2026 } from "@/data/seed";
import type { AptRow, Mode } from "@/types";

export default function Dashboard({ apt, mode, setMode, quarter, setQuarter, openPaymentsDialog }: {
  apt: AptRow, mode: Mode, setMode: (m:Mode)=>void,
  quarter: number, setQuarter: (q:number)=>void, openPaymentsDialog:(id:string)=>void
}) {
  const monthly = calcMonthly(apt, mode);
  const due = monthly * 3;

  return (
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
            <select className="border rounded px-3 py-2" value={quarter} onChange={(e)=>setQuarter(Number(e.target.value))}>
              <option value={1}>I</option><option value={2}>II</option><option value={3}>III</option><option value={4}>IV</option>
            </select>
          </div>
          <div className="ml-auto"><Button variant="outline" onClick={()=>openPaymentsDialog(apt.apt_id)}>Плащания</Button></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="font-semibold mb-2">{apt.apt_id} — Обобщение</h2>
            <Table>
              <TableHeader><TableRow><TableHead>Показател</TableHead><TableHead>Стойност</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>Тип</TableCell><TableCell>{apt.type==="office"?"Офис":"Жилище"}</TableCell></TableRow>
                <TableRow><TableCell>Площ (м²)</TableCell><TableCell>{apt.area_m2}</TableCell></TableRow>
                <TableRow><TableCell>Идеални части (%)</TableCell><TableCell>{apt.ideal_parts_pct}</TableCell></TableRow>
                <TableRow><TableCell>Гараж</TableCell><TableCell>{apt.has_garage?"Да":"Не"}</TableCell></TableRow>
                <TableRow><TableCell>Месечна сума</TableCell><TableCell><b>{money(monthly)} лв</b></TableCell></TableRow>
                <TableRow><TableCell>Тримесечие ×3</TableCell><TableCell><b className="text-lg">{money(due)} лв</b></TableCell></TableRow>
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
              <li><b>Фонд ремонт и обновяване — {money(FUND_2026)} лв</b></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
