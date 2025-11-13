import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AptRow } from "@/types";

const LS_PAY = "psofia.v01.payments";

export type Payment = {
  apt_id: string;
  quarter: 1|2|3|4;
  year: number;
  amount: number;
  ts: string;        // ISO datetime
};

function loadPayments(): Payment[] {
  try { return JSON.parse(localStorage.getItem(LS_PAY) || "[]"); } catch { return []; }
}
function savePayments(list: Payment[]) {
  localStorage.setItem(LS_PAY, JSON.stringify(list));
}

export default function PaymentsDialog({
  open, onOpenChange, apt, quarter, amount
}: { open: boolean; onOpenChange: (o:boolean)=>void; apt: AptRow; quarter: 1|2|3|4; amount: number; }) {
  const year = useMemo(()=> new Date().getFullYear(), []);
  const [busy, setBusy] = useState(false);

  const markPaid = () => {
    setBusy(true);
    const list = loadPayments();
    list.push({ apt_id: apt.apt_id, quarter, year, amount, ts: new Date().toISOString() });
    savePayments(list);
    setBusy(false);
    onOpenChange(false);
    alert("Отбелязано като платено.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Плащане — {apt.apt_id}</DialogTitle>
          <DialogDescription>Маркиране на платено за тримесечие {["I","II","III","IV"][quarter-1]} {year}</DialogDescription>
        </DialogHeader>
        <div className="text-sm space-y-2">
          <div className="flex justify-between"><span>Сума за плащане:</span><b>{amount.toFixed(2)} лв</b></div>
          <div className="flex justify-between"><span>Апартамент:</span><span>{apt.apt_id}</span></div>
          <div className="flex justify-between"><span>Тримесечие:</span><span>{["I","II","III","IV"][quarter-1]} {year}</span></div>
        </div>
        <div className="flex gap-2 justify-end pt-3">
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Затвори</Button>
          <Button onClick={markPaid} disabled={busy}>Отбележи като платено</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// util за други екрани
export const PaymentsStore = { load: loadPayments, save: savePayments };
export type { Payment };
