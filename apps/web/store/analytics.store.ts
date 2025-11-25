/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface AnalyticsState {
  data: any | null;
  loading: boolean;
  fetched: boolean;
  fetchOnce: () => Promise<void>;
}

export const useAnalytics = create<AnalyticsState>((set, get) => ({
  data: {
    stats: {
      askCount: 0,
      ingestCount: 0,
      projectCreated: 0,
      tokenCreated: 0,
      tokenDeleted: 0,
      totalProjects: 0,
      lastEventAt: null,
      totalVectors: 0,
    },
    grouped: { ask: [], ingest: [] },
    events: [],
    allProjects: [],
  },
  loading: false,
  fetched: false,

  fetchOnce: async () => {
    if (get().fetched) return;
    set({ loading: true });

    try {
      const r = await fetch("/api/analytics");
      const json = await r.json();
      set({ data: json, loading: false, fetched: true });
    } catch {
      set({ loading: false });
    }
  },
}));
