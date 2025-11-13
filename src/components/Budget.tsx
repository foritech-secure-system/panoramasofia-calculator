import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BudgetVersion } from "@/types";

export default function Budget({ budgets }: { budgets: BudgetVersion[] }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 grid gap-4">
        <h2 className="font-semibold text-lg">Бюджети</h2>
        {budgets.map(b=>(
          <div key={b.id} className="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-gray-600">В сила от: {b.effectiveFrom} — статус: {b.status}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled>Преглед</Button>
              <Button variant="outline" disabled>Активирай</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
