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
import Select from "react-select";
import blankFlag from "../assets/blank_flag.png";

function PlayerLookupPanel() {
  const { uniquePlayers } = useContext(DataContext);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  /* ---------------- Player options for react-select ---------------- */
  const playerOptions = useMemo(() => {
    const map = new Map();

    uniquePlayers.forEach((row) => {
      if (!map.has(row.player_id)) {
        map.set(row.player_id, row.player_fullname);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({
        value: String(id),
        label: name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [uniquePlayers]);

  /* ---------------- Data for selected player ---------------- */
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
    <div style={{ marginTop: 40 }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>
        Player nationality lookup
      </h2>

      {/* ---------------- Searchable player select ---------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ minWidth: 320 }}>
          <Select
            options={playerOptions}
            placeholder="Type a player name…"
            isClearable
            onChange={(option) =>
              setSelectedPlayerId(option ? option.value : null)
            }
          />
        </div>
      </div>

      {/* ---------------- Bar chart ---------------- */}
      {playerData.length > 0 && (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={playerData}
              layout="vertical"
              margin={{ left: 180, right: 20 }}
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

  const row = data.find((d) => d.country === country);
  const flagSrc = row?.flag || blankFlag;

  return (
    <g transform={`translate(${x},${y})`}>
      <image
        href={flagSrc}
        x={-130}
        y={-30}
        width={50}
        height={50}
        preserveAspectRatio="xMidYMid slice"
      />
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
