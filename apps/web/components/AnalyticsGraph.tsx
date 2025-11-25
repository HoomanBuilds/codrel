/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Card } from "./ui/primitives";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { TimeRange } from "../app/console/analytics/types";
import { formatDate } from "../app/console/analytics/utils";

// Define all available metrics for selection
const METRIC_OPTIONS = {
  ts: { label: "Time", isTime: true },
  ask: { label: "Ask Count", isTime: false },
  ingest: { label: "Ingest Count", isTime: false },
  latency: { label: "Avg Latency (ms)", isTime: false },
  newChunks: { label: "New Chunk Count", isTime: false },
  tokens: { label: "Total Tokens", isTime: false },
  vectorLatency: { label: "Vector Latency", isTime: false },
};

function AnalyticsGraphXY({
  events,
  timeRange,
  getTimeLabel,
}: {
  events: any[];
  timeRange: TimeRange;
  getTimeLabel: (timestamp: string) => string;
}) {
  const [xMetric, setXMetric] = useState("latency");
  const [yMetric, setYMetric] = useState("ask");

  console.log(JSON.stringify(events));
  const timelineData = useMemo(() => {
    const timeMap = new Map();
    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case TimeRange.TODAY:
        startTime = new Date(now.setHours(now.getHours() - 24));
        break;
      case TimeRange.WEEK:
        startTime = new Date(now.setDate(now.getDate() - 7));
        break;
      case TimeRange.MONTH:
        startTime = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startTime = new Date(now.setHours(now.getHours() - 24));
    }

    const filtered = events?.filter((e) => new Date(e.ts) >= startTime);

    filtered?.forEach((evt) => {
      const t = new Date(evt.ts);
      t.setMinutes(0, 0, 0);
      const key = t.toISOString();

      if (!timeMap.has(key)) {
        timeMap.set(key, {
          ts: key,
          ask: 0,
          ingest: 0,
          latency_sum: 0,
          latency_count: 0,
          newChunks: 0,
          tokens: 0,
          vectorLatency_sum: 0,
          sqlLatency_sum: 0,
          quotaLatency_sum: 0,
          parseLatency_sum: 0,
        });
      }

      const entry = timeMap.get(key);

      if (evt.event === "ask") {
        entry.ask++;
        entry.latency_sum += evt.metadata.latency_ms || 0;
        entry.latency_count++;

        entry.vectorLatency_sum += evt.metadata.vector_latency_ms || 0;
        entry.sqlLatency_sum += evt.metadata.sql_latency_ms || 0;
        entry.quotaLatency_sum += evt.metadata.quota_latency_ms || 0;
        entry.parseLatency_sum += evt.metadata.parse_latency_ms || 0;
      }

      if (evt.event === "ingest") {
        entry.ingest++;
        entry.newChunks += evt.metadata.newChunkCount || 0;
        entry.tokens += evt.metadata.totalTokens || 0;

        entry.latency_sum += evt.metadata.latency_ms || 0;
        entry.latency_count++;

        entry.vectorLatency_sum += evt.metadata.vector_latency_ms || 0;
        entry.sqlLatency_sum += evt.metadata.sql_latency_ms || 0;
        entry.quotaLatency_sum += evt.metadata.quota_latency_ms || 0;
        entry.parseLatency_sum += evt.metadata.parse_latency_ms || 0;
      }
    });

    return [...timeMap.values()].map((e) => ({
      ...e,
      latency: e.latency_count
        ? Math.round(e.latency_sum / e.latency_count)
        : 0,
      vectorLatency: Math.round(e.vectorLatency_sum / (e.latency_count || 1)),
      sqlLatency: Math.round(e.sqlLatency_sum / (e.latency_count || 1)),
      quotaLatency: Math.round(e.quotaLatency_sum / (e.latency_count || 1)),
      parseLatency: Math.round(e.parseLatency_sum / (e.latency_count || 1)),
    }));
  }, [events, timeRange]);

  return (
    <Card className="lg:col-span-2 p-6 h-full bg-[#1c1c1c] border-neutral-800 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-mono text-neutral-300 uppercase">
          Custom Graph
        </h3>

        <div className="flex gap-2">
          <select
            className="bg-[#111] border border-neutral-800 text-xs px-2 py-1 rounded"
            value={xMetric}
            onChange={(e) => setXMetric(e.target.value)}
          >
            {Object.entries(METRIC_OPTIONS).map(([key, m]) => (
              <option key={key} value={key}>
                X → {m.label}
              </option>
            ))}
          </select>

          <select
            className="bg-[#111] border border-neutral-800 text-xs px-2 py-1 rounded"
            value={yMetric}
            onChange={(e) => setYMetric(e.target.value)}
          >
            {Object.entries(METRIC_OPTIONS).map(([key, m]) => (
              <option key={key} value={key}>
                Y → {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              dataKey={xMetric}
              tickFormatter={(v: any) =>
                METRIC_OPTIONS[xMetric as keyof typeof METRIC_OPTIONS].isTime
                  ? getTimeLabel(v)
                  : v
              }
              stroke="#404040"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#404040" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={yMetric}
              stroke="#22c55e"
              fill="#22c55e"
              dot
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#191919] border border-neutral-800 p-3 rounded-md text-xs font-mono">
      <p className="text-neutral-400 mb-2 border-b border-neutral-800 pb-1">
        {formatDate(label)}
      </p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-neutral-300 capitalize">{entry.name}:</span>
          <span className="text-white font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsGraphXY;
