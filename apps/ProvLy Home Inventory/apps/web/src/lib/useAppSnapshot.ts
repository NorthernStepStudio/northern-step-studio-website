"use client";

import { useEffect, useState } from "react";

import { AppSnapshot, loadAppSnapshot } from "@/lib/appData";

export function useAppSnapshot() {
  const [data, setData] = useState<AppSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await loadAppSnapshot());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load account",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { data, loading, error, reload: load };
}
