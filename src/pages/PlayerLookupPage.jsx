import PlayerLookupPanel from "../components/PlayerLookupPanel";
import { useNavigate } from "react-router-dom";

function PlayerLookupPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 600 }}>
          Player Nationality Lookup
        </h1>
        <p style={{ color: "#6b7280" }}>
          Explore predicted national team eligibility by player
        </p>
      </div>

      <PlayerLookupPanel />

      {/* Optional back link */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          ← Back to map
        </button>
      </div>
    </div>
  );
}

export default PlayerLookupPage;
