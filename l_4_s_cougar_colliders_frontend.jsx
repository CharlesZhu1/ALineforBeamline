import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = { time: number; value: number };
type Transistor = { id: number; active: boolean; flashes: number };

const MAX_SECONDS = 180;

export default function App() {
  const [bitFlip, setBitFlip] = useState(28);
  const [flux, setFlux] = useState(22);
  const [windowSize, setWindowSize] = useState(30);

  const [bitData, setBitData] = useState<Point[]>([]);
  const [fluxData, setFluxData] = useState<Point[]>([]);
  const [tick, setTick] = useState(0);

  const [transistors, setTransistors] = useState<Transistor[]>(
    Array.from({ length: 85 }, (_, i) => ({ id: i + 1, active: false, flashes: 0 }))
  );
  const [lastEvent, setLastEvent] = useState("No events yet");

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => {
        if (prev >= MAX_SECONDS) return prev;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tick === 0) return;

    setBitData((prev) => {
      if (prev.length >= MAX_SECONDS) return prev;
      const value = bitFlip + Math.random() * 4 - 2 + Math.sin(tick / 9) * 1.2;
      return [...prev, { time: tick, value: Number(value.toFixed(2)) }];
    });

    setFluxData((prev) => {
      if (prev.length >= MAX_SECONDS) return prev;
      const value = flux + Math.random() * 3 - 1.5 + Math.cos(tick / 11) * 0.9;
      return [...prev, { time: tick, value: Number(value.toFixed(2)) }];
    });

    setTransistors((prev) => {
      const next = prev.map((t) => ({ ...t, active: false }));
      const flipsThisTick = Math.max(1, Math.min(6, Math.floor(bitFlip / 15) + 1));
      const chosen = new Set<number>();

      while (chosen.size < flipsThisTick) {
        chosen.add(Math.floor(Math.random() * next.length));
      }

      const labels: string[] = [];
      chosen.forEach((index) => {
        next[index] = {
          ...next[index],
          active: true,
          flashes: next[index].flashes + 1,
        };
        labels.push(`T${next[index].id}`);
      });

      setLastEvent(`t=${tick}s · flipped ${labels.join(", ")}`);
      return next;
    });
  }, [tick, bitFlip, flux]);

  const visibleBit = useMemo(() => bitData.slice(-windowSize), [bitData, windowSize]);
  const visibleFlux = useMemo(() => fluxData.slice(-windowSize), [fluxData, windowSize]);
  const activeCount = useMemo(() => transistors.filter((t) => t.active).length, [transistors]);

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Radiation Detector Dashboard</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(180px, 240px))",
            gap: 16,
            marginBottom: 28,
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>Bit-flip base value</label>
            <input
              type="number"
              value={bitFlip}
              onChange={(e) => setBitFlip(Number(e.target.value))}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #475569",
                background: "#111827",
                color: "white",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8 }}>Flux base value</label>
            <input
              type="number"
              value={flux}
              onChange={(e) => setFlux(Number(e.target.value))}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #475569",
                background: "#111827",
                color: "white",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8 }}>Show last</label>
            <select
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #475569",
                background: "#111827",
                color: "white",
              }}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={120}>120 seconds</option>
              <option value={180}>180 seconds</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
          <div>
            <h2 style={{ marginBottom: 12 }}>Bit-flip rate (live)</h2>
            <div style={{ width: "100%", height: 300, background: "#111827", padding: 12, borderRadius: 14, border: "1px solid #334155" }}>
              <ResponsiveContainer>
                <LineChart data={visibleBit}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" allowDuplicatedCategory={false} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: 12 }}>Flux profile (live)</h2>
            <div style={{ width: "100%", height: 300, background: "#111827", padding: 12, borderRadius: 14, border: "1px solid #334155" }}>
              <ResponsiveContainer>
                <LineChart data={visibleFlux}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" allowDuplicatedCategory={false} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "1.25fr 0.75fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <h2 style={{ marginBottom: 12 }}>Live transistor grid</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
                gap: 8,
                background: "#111827",
                padding: 16,
                borderRadius: 14,
                border: "1px solid #334155",
              }}
            >
              {transistors.map((t) => (
                <div
                  key={t.id}
                  title={`T${t.id} · total flips: ${t.flashes}`}
                  style={{
                    padding: "10px 4px",
                    borderRadius: 10,
                    border: t.active ? "1px solid #93c5fd" : "1px solid #334155",
                    background: t.active ? "#2563eb" : "#1f2937",
                    color: "white",
                    fontSize: 12,
                    textAlign: "center",
                    boxShadow: t.active ? "0 0 12px rgba(59,130,246,0.55)" : "none",
                  }}
                >
                  T{t.id}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Detector event panel</h2>
            <div style={{ marginBottom: 12 }}>
              <strong>Elapsed:</strong> {tick}s / {MAX_SECONDS}s
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Active this second:</strong> {activeCount}
            </div>
            <div style={{ marginBottom: 12, lineHeight: 1.5 }}>
              <strong>Last event:</strong> {lastEvent}
            </div>
            <div style={{ opacity: 0.75, lineHeight: 1.6 }}>
              Data collection stops automatically after 180 seconds. Change the dropdown to show the last 30, 60, 120, or 180 seconds of data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
