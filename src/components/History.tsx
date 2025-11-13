import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function History() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="font-semibold text-lg">История</h2>
        <p className="text-sm text-gray-600">
          Тук ще виждате архив на бюджети/договори и плащания по периоди.
        </p>
        <div className="text-xs text-gray-500">* Планирано: филтри по апартамент и период, експорт (CSV/PDF).</div>
      </CardContent>
    </Card>
  );
}
