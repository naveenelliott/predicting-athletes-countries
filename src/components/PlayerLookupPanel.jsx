import { useContext, useMemo, useState } from "react";
import { DataContext } from "../context/DataContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import blankFlag from "../assets/blank_flag.png";

function PlayerLookupPanel() {
  const { uniquePlayers } = useContext(DataContext);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const playerOptions = useMemo(() => {
    const map = new Map();

    uniquePlayers.forEach((row) => {
      if (!map.has(row.player_id)) {
        map.set(row.player_id, row.player_fullname);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id: String(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [uniquePlayers]);

  const playerData = useMemo(() => {
    if (!selectedPlayerId) return [];

    return uniquePlayers
      .filter((r) => String(r.player_id) === selectedPlayerId)
      .map((r) => ({
        country: r.predicted_country,
        prob: Number(r.pred_prob_correct),
        flag: r.flag,
      }))
      .filter((d) => !Number.isNaN(d.prob))
      .sort((a, b) => b.prob - a.prob);
  }, [uniquePlayers, selectedPlayerId]);

  return (
    <div style={{ marginTop: 60 }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>
        Player nationality lookup
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <select
          value={selectedPlayerId}
          onChange={(e) => setSelectedPlayerId(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            minWidth: 280,
            fontSize: 14,
          }}
        >
          <option value="">Select a player</option>
          {playerOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {playerData.length > 0 && (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={playerData}
              layout="vertical"
              margin={{ left: 160, right: 20 }}
            >
              <XAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) =>
                  `${(v * 100).toFixed(0)}%`
                }
              />
              <YAxis
                type="category"
                dataKey="country"
                width={180}
                tick={<CountryTick data={playerData} />}
              />
              <Tooltip
                formatter={(v) =>
                  `${(v * 100).toFixed(1)}%`
                }
              />
              <Bar
                dataKey="prob"
                fill="#3b82f6"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ---------- Custom Y-axis tick with flag ---------- */
function CountryTick({ x, y, payload, data }) {
  const country = payload.value;

  const row = data.find(
    (d) => d.country === country
  );

  const flagSrc = row?.flag || blankFlag;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Flag (real or blank) */}
      <image
        href={flagSrc}
        x={-130}
        y={-30}
        width={50}
        height={50}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Country name */}
      <text
        x={-8}
        y={4}
        textAnchor="end"
        fill="#374151"
        fontSize={12}
      >
        {country}
      </text>
    </g>
  );
}

export default PlayerLookupPanel;
