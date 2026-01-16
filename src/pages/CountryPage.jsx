import { useParams } from "react-router-dom";
import { useContext, useMemo } from "react";
import { DataContext } from "../context/DataContext";

function CountryPage() {
  const { countryName } = useParams();
  const decodedCountry = decodeURIComponent(countryName);
  const { countryStats } = useContext(DataContext);

  const players = countryStats[decodedCountry] ?? [];

  // 🔹 Country-level flag (same for all rows on this page)
  const countryFlag =
    players.length > 0 ? players[0].flag : null;

  /* ---------------- Split players ---------------- */
  const { correctPlayers, incorrectPlayers } = useMemo(() => {
    const correctPlayers = [];
    const incorrectPlayers = [];

    players.forEach((p) => {
      if (Number(p.pred_correct) === 1) {
        correctPlayers.push(p);
      } else {
        incorrectPlayers.push(p);
      }
    });

    return { correctPlayers, incorrectPlayers };
  }, [players]);

  /* ---------------- Summary stats ---------------- */
  const summary = useMemo(() => {
    if (players.length === 0) return null;

    const count = players.length;
    const avgProb =
      players.reduce((s, d) => s + d.pred_prob_correct, 0) /
      count;

    return { count, avgProb };
  }, [players]);

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      {/* ---------- Header with flag ---------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        {countryFlag && (
          <img
            src={countryFlag}
            alt={`${decodedCountry} flag`}
            style={{
              width: 75,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #e5e7eb",
            }}
          />
        )}

        <h1 style={{ fontSize: 32, margin: 0 }}>
          {decodedCountry}
        </h1>
      </div>

      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Predicted national team players
      </p>

      {/* ---------- Summary cards ---------- */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard label="Total Players" value={summary.count} />
          <StatCard
            label="Avg Probability"
            value={summary.avgProb.toFixed(2)}
          />
        </div>
      )}

      {/* ---------- Tables ---------- */}
      {players.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No players available.</p>
      ) : (
        <>
          <PlayerTable
            title={`Athletes Predicted to Represent ${decodedCountry}`}
            players={correctPlayers}
          />
          <PlayerTable
            title={`Athletes with Potential to Represent ${decodedCountry}`}
            players={incorrectPlayers}
          />
        </>
      )}
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function PlayerTable({ title, players }) {
  const sortedPlayers = useMemo(() => {
    return [...players].sort(
      (a, b) => b.pred_prob_correct - a.pred_prob_correct
    );
  }, [players]);

  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>
        {title} ({sortedPlayers.length})
      </h3>

      {sortedPlayers.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No players.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <th style={{ padding: "8px 4px" }}>Player</th>
              <th style={{ padding: "8px 4px" }}>Probability</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((row) => (
              <tr
                key={row.player_id}
                style={{ borderBottom: "1px solid #e5e7eb" }}
              >
                <td style={{ padding: "8px 4px" }}>
                  {row.player_fullname}
                </td>
                <td style={{ padding: "8px 4px" }}>
                  {row.pred_prob_correct.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CountryPage;
