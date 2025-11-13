import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { calcMonthly, money } from "@/lib/calc";
import type { AptRow } from "@/types";

export default function Apartments({ rows, openPaymentsDialog }: {
  rows: AptRow[], openPaymentsDialog:(id:string)=>void
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="font-semibold mb-3">Всички апартаменти</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ап.</TableHead><TableHead>Тип</TableHead>
              <TableHead>м²</TableHead><TableHead>ИЧ %</TableHead>
              <TableHead>Гараж</TableHead><TableHead>Месец (A)</TableHead>
              <TableHead>Месец (B)</TableHead><TableHead>Плащания</TableHead>
            </TableRow>
          </TableHeader>
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
                <TableCell><Button size="sm" variant="outline" onClick={()=>openPaymentsDialog(r.apt_id)}>Плащания</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
