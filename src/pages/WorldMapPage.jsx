import { useContext } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { DataContext } from "../context/DataContext";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function CountrySearch({ countryOptions }) {
  const navigate = useNavigate();

  const options = countryOptions.map((c) => ({
    value: c,
    label: c,
  }));

  return (
    <div style={{ minWidth: 280 }}>
      <Select
        options={options}
        placeholder="Type to search a country…"
        isClearable
        onChange={(option) => {
          if (option) {
            navigate(`/country/${encodeURIComponent(option.value)}`);
          }
        }}
      />
    </div>
  );
}

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

function WorldMapPage() {
  const navigate = useNavigate();
  const { countryStats } = useContext(DataContext);

  const countryOptions = Object.keys(countryStats)
  .sort((a, b) => a.localeCompare(b));

  // color scale by player count
  const getFillColor = (count) => {
    if (!count) return "#e5e7eb";
    if (count >= 10) return "#1e40af";
    if (count >= 5) return "#3b82f6";
    if (count >= 2) return "#93c5fd";
    return "#bfdbfe";
  };

  return (
    <div style={{ padding: 10 }}>
    <div
      style={{
        textAlign: "center"
      }}
    >

        <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 12,
      marginBottom: 20,
    }}
  >
    <TabButton active label="Map" />
    <TabButton
      label="Players"
      onClick={() => navigate("/players")}
    />
  </div>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Predicted National Teams
      </h1>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <label
          htmlFor="country-select"
          style={{
            fontWeight: 500,
            fontSize: 14,
            color: "#374151",
          }}
        >
          Jump to country
        </label>

        <CountrySearch countryOptions={countryOptions} />
      </div>
    </div>

      <ComposableMap projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) => {
            /* ===============================
               1️⃣ Build map country set
            =============================== */
            const mapCountrySet = new Set(
              geographies
                .map((g) => g.properties?.name)
                .filter(Boolean)
            );

            /* ===============================
               2️⃣ Find data countries not on map
            =============================== */
            const dataCountries = Object.keys(countryStats);

            const dataNotOnMap = dataCountries.filter(
              (c) => !mapCountrySet.has(c)
            );

            /* ===============================
               3️⃣ Log ONCE (important)
            =============================== */
            if (dataNotOnMap.length > 0) {
              console.log(
                `Countries in data but NOT on map (${dataNotOnMap.length}):`
              );
              console.table(
                dataNotOnMap.map((c) => ({
                  predicted_country: c,
                  count: countryStats[c]?.length ?? 0,
                }))
              );
            }

            /* ===============================
               4️⃣ Render map
            =============================== */
            return geographies.map((geo) => {
              const countryName = geo.properties.name;
              const players = countryStats[countryName];

              const count = players?.length ?? 0;

              const avgProb =
                count > 0
                  ? players.reduce(
                      (s, d) => s + d.pred_prob_correct,
                      0
                    ) / count
                  : null;

              const tooltipText =
                count > 0
                  ? `${countryName}
Players: ${count}
Avg Prob: ${avgProb.toFixed(2)}`
                  : `${countryName}: No data`;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFillColor(count)}
                  data-tooltip-id="map-tooltip"
                  data-tooltip-content={tooltipText}
                  onClick={() => {
                    if (count > 0) {
                      navigate(
                        `/country/${encodeURIComponent(countryName)}`
                      );
                    }
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "#f97316",
                      outline: "none",
                      cursor: count > 0 ? "pointer" : "default",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>

      <Tooltip id="map-tooltip" />
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 18px",
        borderRadius: 999,
        border: "1px solid #d1d5db",
        background: active ? "#1e40af" : "#f9fafb",
        color: active ? "#ffffff" : "#374151",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export default WorldMapPage;
