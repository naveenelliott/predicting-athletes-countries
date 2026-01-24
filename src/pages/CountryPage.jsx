import { useParams, Link } from "react-router-dom";
import { useContext, useMemo } from "react";
import { DataContext } from "../context/DataContext";
import blankPlayer from "../assets/blank_player.png";

function CountryPage() {
  const { countryName } = useParams();
  const decodedCountry = decodeURIComponent(countryName);
  const { countryStats } = useContext(DataContext);

  const players = countryStats[decodedCountry] ?? [];

  const countryFlag = players.length > 0 ? players[0].flag : null;

  /* ---------------- Split players ---------------- */
  const { correctPlayers, incorrectPlayers } = useMemo(() => {
    const correct = [];
    const incorrect = [];

    players.forEach((p) => {
      Number(p.pred_correct) === 1 ? correct.push(p) : incorrect.push(p);
    });

    return { correctPlayers: correct, incorrectPlayers: incorrect };
  }, [players]);

  /* ---------------- Summary ---------------- */
  const summary = useMemo(() => {
    if (!players.length) return null;

    return {
      count: players.length,
      avgProb:
        players.reduce((s, d) => s + d.pred_prob_correct, 0) /
        players.length,
    };
  }, [players]);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* ---------- Header ---------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 12,
        }}
      >
        {countryFlag && (
          <img
            src={countryFlag}
            alt={`${decodedCountry} flag`}
            style={{
              width: 90,
              height: 60,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              objectFit: "cover",
            }}
          />
        )}
        <h1 style={{ fontSize: 36, margin: 0 }}>{decodedCountry}</h1>
      </div>

      <p style={{ color: "#6b7280", marginBottom: 28 }}>
        Players with predicted national team eligibility
      </p>

      {/* ---------- Summary cards ---------- */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <StatCard label="Total Players" value={summary.count} />
          <StatCard
            label="Average Probability"
            value={summary.avgProb.toFixed(2)}
          />
        </div>
      )}

      {/* ---------- Player sections ---------- */}
      <PlayerSection
        title="Likely Representatives"
        players={correctPlayers}
      />

      <PlayerSection
        title="Potential Representatives"
        players={incorrectPlayers}
      />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function PlayerSection({ title, players }) {
  if (!players.length) return null;

  const sorted = [...players].sort(
    (a, b) => b.pred_prob_correct - a.pred_prob_correct
  );

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>
        {title} ({sorted.length})
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {sorted.map((player) => (
          <PlayerCard key={player.player_id} player={player} />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player }) {
  return (
    <Link
      to={`/player/${player.player_id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: "#ffffff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        position: "relative",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      >
        {player.rating !== undefined && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#111827",
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 999,
          }}
        >
          {player.rating.toFixed(1)}
        </div>
      )}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <img
            src={player.player_photo || blankPlayer}
            alt={player.player_fullname}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #e5e7eb",
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {player.player_fullname}
            </div>

            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {player.position} · {player.club}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
            color: "#374151",
          }}
        >
          <span>Probability</span>
          <strong>{player.pred_prob_correct.toFixed(2)}</strong>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

export default CountryPage;
