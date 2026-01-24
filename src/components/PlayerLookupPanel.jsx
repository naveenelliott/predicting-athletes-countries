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
import blankPlayer from "../assets/blank_player.png";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useEffect } from "react";

/* ================= PLAYER LOOKUP PANEL ================= */
function PlayerLookupPanel({ initialPlayerId = null }) {
  const { uniquePlayers } = useContext(DataContext);
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    initialPlayerId ? String(initialPlayerId) : null
    );

    useEffect(() => {
    if (initialPlayerId) {
        setSelectedPlayerId(String(initialPlayerId));
    }
    }, [initialPlayerId]);

  /* ---------------- Player options ---------------- */
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

  /* ---------------- Selected player ---------------- */
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    return uniquePlayers.find(
      (r) => String(r.player_id) === selectedPlayerId
    );
  }, [uniquePlayers, selectedPlayerId]);

  /* ---------------- Radar metrics by position ---------------- */
  const RADAR_METRICS_BY_POSITION = {
    Goalkeeper: [
      { metric: "Passes", key: "passes" },
      { metric: "Key Passes", key: "key_passes" },
      { metric: "Duels", key: "duels" },
      { metric: "Duels Won", key: "duels_won" },
      { metric: "Tackles", key: "tackles" },
      { metric: "Interceptions", key: "interceptions" },
    ],
    Defender: [
      { metric: "Tackles", key: "tackles" },
      { metric: "Blocks", key: "blocks" },
      { metric: "Interceptions", key: "interceptions" },
      { metric: "Fouls Committed", key: "fouls_committed" },
      { metric: "Duels", key: "duels" },
      { metric: "Duels Won", key: "duels_won" },
      { metric: "Passes", key: "passes" },
      { metric: "Key Passes", key: "key_passes" },
    ],
    Midfielder: [
      { metric: "Shots", key: "shots" },
      { metric: "Key Passes", key: "key_passes" },
      { metric: "Passes", key: "passes" },
      { metric: "Tackles", key: "tackles" },
      { metric: "Interceptions", key: "interceptions" },
      { metric: "Attempted Dribbles", key: "dribbles_attempted" },
      { metric: "Dribbles", key: "dribbles_success" },
      { metric: "Duels", key: "duels" },
      { metric: "Duels Won", key: "duels_won" },
    ],
    Attacker: [
      { metric: "Goals", key: "goals" },
      { metric: "Shots", key: "shots" },
      { metric: "Assists", key: "assists" },
      { metric: "Key Passes", key: "key_passes" },
      { metric: "Attempted Dribbles", key: "dribbles_attempted" },
      { metric: "Dribbles", key: "dribbles_success" },
      { metric: "Fouls Drawn", key: "fouls_drawn" },
      { metric: "Duels", key: "duels" },
      { metric: "Duels Won", key: "duels_won" },
    ],
  };

  /* ---------------- Radar data ---------------- */
  const radarData = useMemo(() => {
    if (!selectedPlayer) return [];
    const metrics = RADAR_METRICS_BY_POSITION[selectedPlayer.position] || [];

    return metrics
      .map(({ metric, key }) => ({
        metric,
        value: selectedPlayer[key],
      }))
      .filter(
        (d) =>
          d.value !== undefined &&
          d.value !== null &&
          !Number.isNaN(d.value)
      );
  }, [selectedPlayer]);

  /* ---------------- Nationality data ---------------- */
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
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 5);
  }, [uniquePlayers, selectedPlayerId]);

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>
        Player nationality lookup
      </h2>

      {/* Player select */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div style={{ minWidth: 320 }}>
          <Select
            options={playerOptions}
            placeholder="Type a player name…"
            isClearable
            onChange={(o) => setSelectedPlayerId(o ? o.value : null)}
          />
        </div>
      </div>

      {/* Player profile card */}
      {selectedPlayer && (
        <div
          style={{
            display: "flex",
            gap: 28,
            padding: 24,
            borderRadius: 16,
            background: "#ffffff",
            maxWidth: 900,
            margin: "0 auto 40px auto",
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            flexWrap: "wrap",
          }}
        >
          <img
            src={selectedPlayer.player_photo || blankPlayer}
            alt={selectedPlayer.player_fullname}
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #e5e7eb",
            }}
          />

          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{ margin: 0, fontSize: 26 }}>
              {selectedPlayer.player_fullname}
            </h3>

            <div style={{ fontSize: 16, color: "#374151", marginTop: 6 }}>
              {selectedPlayer.position} · {selectedPlayer.club}
            </div>

            <div style={{ fontSize: 14, color: "#6b7280", marginTop: 10 }}>
              Age {selectedPlayer.age} · {selectedPlayer.height_cm} cm ·{" "}
              {selectedPlayer.weight_kg} kg
            </div>

            <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>
              Minutes: {selectedPlayer.minutes ?? "—"} · Rating:{" "}
              {selectedPlayer.rating
                ? Number(selectedPlayer.rating).toFixed(2)
                : "—"}
            </div>

            <div style={{ fontSize: 14, color: "#6b7280", marginTop: 6 }}>
              Goals / 90: {selectedPlayer.goals_p90?.toFixed(2) ?? "—"} ·
              Assists / 90: {selectedPlayer.assists_p90?.toFixed(2) ?? "—"}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {(radarData.length > 0 || playerData.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 32,
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {/* Radar */}
          {radarData.length > 0 && (
            <ChartCard title="Performance Benchmark">
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" radialLines={false} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} tickCount={6} stroke='black' />
                  <Tooltip />
                  <Radar
                    dataKey="value"
                    stroke="gray"
                    fill="gray"
                    fillOpacity={0.6}
                    dot={{ r: 3 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Nationality */}
          {playerData.length > 0 && (
            <ChartCard title="Predicted Nationality">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={playerData}
                  layout="vertical"
                  margin={{ left: 140, right: 20 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="country"
                    tick={<CountryTick data={playerData} />}
                  />
                  <Tooltip
                    formatter={(v) => `${(v * 100).toFixed(1)}%`}
                  />
                  <Bar dataKey="prob" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Shared components ---------- */

function ChartCard({ title, children }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h4 style={{ textAlign: "center", marginBottom: 8 }}>{title}</h4>
      {children}
    </div>
  );
}

function CountryTick({ x, y, payload, data }) {
  const row = data.find((d) => d.country === payload.value);
  const flagSrc = row?.flag || blankFlag;

  return (
    <g transform={`translate(${x},${y})`}>
      <image href={flagSrc} x={-130} y={-30} width={50} height={50} />
      <text x={-8} y={4} textAnchor="end" fontSize={12}>
        {payload.value}
      </text>
    </g>
  );
}

export default PlayerLookupPanel;
