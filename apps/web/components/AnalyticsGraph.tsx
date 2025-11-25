/* AnalyticsGraphXY - working version + proper CustomTooltip */

import React, { useMemo } from "react";
import { Card } from "./ui/primitives";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

function formatShortTime(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AnalyticsGraphXY({ events }: { events: any[] }) {
  const data = useMemo(() => {
    if (!Array.isArray(events)) return [];

    const map = new Map();

    for (const evt of events) {
      const ts = new Date(evt.ts);
      // ts.setSeconds(0, 0); // bucket by minute
      // ts.setMinutes(0, 0, 0); // bucket by hour

      ts.setSeconds(0, 0);
      const m = ts.getMinutes();
      const half = m < 30 ? 0 : 30;
      ts.setMinutes(half, 0, 0); // bucket by half hour

      const key = ts.getTime();

      const row = map.get(key) || {
        tsMs: key,
        ask: 0,
        ingest: 0,
        token_create: 0,
        token_delete: 0,
        latency_sum: 0,
        latency_count: 0,
        project_created: 0,
        project_deleted: 0,
      };

      if (evt.event === "ask") row.ask++;
      if (evt.event === "ingest") row.ingest++;
      if (evt.event === "token_create") row.token_create++;
      if (evt.event === "token_delete") row.token_delete++;
      if (evt.event === "project_create") row.project_created++;
      if (evt.event === "project_delete") row.project_deleted++;

      if (evt.metadata?.latency_ms != null) {
        row.latency_sum += evt.metadata.latency_ms;
        row.latency_count++;
      }

      map.set(key, row);
    }

    const arr = Array.from(map.values()).sort((a, b) => a.tsMs - b.tsMs);

    const base = arr[0]?.tsMs || 0;
    arr.forEach((r) => {
      r.x = r.tsMs - base;
      r.avgLatency =
        r.latency_count > 0 ? Math.round(r.latency_sum / r.latency_count) : 0;
    });

    return arr;
  }, [events]);

  return (
    <Card className="p-6 bg-[#1c1c1c] border-neutral-800 flex flex-col  col-span-2">
      <h3 className="text-sm font-mono text-neutral-300 uppercase mb-4">
        Activity Overview
      </h3>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />

            <XAxis
              dataKey="x"
              type="number"
              tickFormatter={(v) => formatShortTime(data[0].tsMs + v)}
              stroke="#404040"
              fontSize={11}
            />

            {/* LEFT: Activity axis */}
            <YAxis
              yAxisId="left"
              stroke="#404040"
              fontSize={11}
              allowDecimals={false}
            />

            {/* RIGHT: Ingest axis */}
            <YAxis
              allowDecimals={false}
              yAxisId="right"
              orientation="right"
              stroke="#555"
              fontSize={11}
            />

            <Tooltip content={<CustomTooltip base={data[0]?.tsMs || 0} />} />

            {/* ACTIVITY — left axis */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={(row) =>
                row.ask + row.ingest + row.token_create + row.token_delete
              }
              name="Activity"
              stroke="#22c55e"
              fill="transparent"
              fillOpacity={0.2}
              strokeWidth={2}
              dot
            />

            {/* INGEST — right axis (GRAY) */}
            <Area
              yAxisId="right"
              type="step"
              dataKey="ingest"
              name="Ingest"
              stroke="#666"
              fill="#666"
              fillOpacity={0.15}
              strokeWidth={2}
              dot
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, base }: any) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  const fullTime = new Date(base + row.x).toLocaleString();

  return (
    <div className="bg-[#191919] border border-neutral-800 p-3 rounded-md text-xs font-mono min-w-[170px]">
      <p className="text-neutral-400 mb-2 border-b border-neutral-800 pb-1">
        {fullTime}
      </p>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-neutral-300">ask:</span>
        <span className="text-white font-bold">{row.ask}</span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-neutral-300">ingest:</span>
        <span className="text-white font-bold">{row.ingest}</span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-neutral-300">token_create:</span>
        <span className="text-white font-bold">{row.token_create}</span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-neutral-300">token_delete:</span>
        <span className="text-white font-bold">{row.token_delete}</span>
      </div>

      <div className="mt-2 pt-2 border-t border-neutral-800">
        <span className="text-neutral-400">avgLatency: </span>
        <span className="text-white">{row.avgLatency} ms</span>
      </div>

      <div className="mt-2 pt-2 border-t border-neutral-800">
        <span className="text-neutral-300">project_create: </span>
        <span className="text-white">{row.project_created}</span>
      </div>

      <div className="">
        <span className="text-neutral-300">project_delete: </span>
        <span className="text-white">{row.project_deleted}</span>
      </div>
    </div>
  );
}
