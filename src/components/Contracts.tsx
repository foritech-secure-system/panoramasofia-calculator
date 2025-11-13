import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/calc";
import type { Contract } from "@/types";

export default function Contracts({ contracts }: { contracts: Contract[] }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 grid gap-4">
        <h2 className="font-semibold text-lg">Договори с фирми</h2>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Услуга</TableHead><TableHead>Доставчик</TableHead>
            <TableHead>Период</TableHead><TableHead>Месечна цена</TableHead><TableHead>Документ</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {contracts.map(c=>(
              <TableRow key={c.id}>
                <TableCell>{c.service}</TableCell><TableCell>{c.vendor}</TableCell>
                <TableCell>{c.startDate} — {c.endDate || "безсрочен"}</TableCell>
                <TableCell>{money(c.monthlyCost)} лв</TableCell>
                <TableCell>{c.docUrl ? <a className="text-blue-600 underline" href={c.docUrl} target="_blank">линк</a> : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outline" disabled>Добави договор</Button>
      </CardContent>
    </Card>
  );
}
