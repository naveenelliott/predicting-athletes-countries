import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { DataContext } from "../context/DataContext";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMapPage() {
  const navigate = useNavigate();
  const { countryStats } = useContext(DataContext);

  // color scale by player count
  const getFillColor = (count) => {
    if (!count) return "#e5e7eb";
    if (count >= 10) return "#1e40af";
    if (count >= 5) return "#3b82f6";
    if (count >= 2) return "#93c5fd";
    return "#bfdbfe";
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Predicted National Teams</h1>

      <ComposableMap projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
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
            })
          }
        </Geographies>
      </ComposableMap>

      <Tooltip id="map-tooltip" />
    </div>
  );
}

export default WorldMapPage;
