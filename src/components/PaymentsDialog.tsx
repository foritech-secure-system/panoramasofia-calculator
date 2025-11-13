import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/types";
import { money } from "@/lib/calc";

interface Props {
  aptId: string | null;
  payments: Payment[];
  onClose: () => void;
  onAdd: (p: Payment) => void;
}

export default function PaymentsDialog({ aptId, payments, onClose, onAdd }: Props) {
  const [form, setForm] = useState({ period: "", amount: "", date: "" });
  const add = () => {
    if (!aptId || !form.period || !form.amount || !form.date) return;
    onAdd({ id: "p" + Math.random().toString(36).slice(2,8), apt_id: aptId, period: form.period, amount: Number(form.amount), date: form.date });
    setForm({ period: "", amount: "", date: "" });
  };

  return (
    <Dialog open={!!aptId} onOpenChange={(o)=>!o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Плащания — {aptId ?? ""}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {payments.filter(p=>p.apt_id===aptId).map(p=>(
            <div key={p.id} className="flex justify-between border rounded p-2 text-sm">
              <div>{p.period} — {money(p.amount)} лв</div>
              <div className="text-gray-500">{p.date}</div>
            </div>
          ))}
          <div className="border rounded p-3 grid md:grid-cols-3 gap-2 text-sm">
            <Input placeholder="Период (напр. 2025-Q4)" value={form.period} onChange={e=>setForm(v=>({...v, period:e.target.value}))}/>
            <Input placeholder="Сума (лв)"                value={form.amount} onChange={e=>setForm(v=>({...v, amount:e.target.value}))}/>
            <Input placeholder="Дата (YYYY-MM-DD)"       value={form.date}   onChange={e=>setForm(v=>({...v, date:e.target.value}))}/>
            <div className="md:col-span-3 flex justify-end">
              <Button onClick={add}>Добави</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
