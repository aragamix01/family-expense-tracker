"use client";

import { useEffect, useState } from "react";
import type { Period } from "@/lib/database.types";

export function useActivePeriod() {
  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/periods")
      .then((r) => r.json())
      .then((periods: Period[]) => {
        const open = periods.find((p) => p.status === "open") ?? periods[0] ?? null;
        setPeriod(open);
      })
      .finally(() => setLoading(false));
  }, []);

  return { period, loading };
}
