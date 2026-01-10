import { useContext, useMemo, useState } from "react";
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
  const { data } = useContext(DataContext);
  const [tooltip, setTooltip] = useState("");

  // country_code → value
  const dataMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.country_code] = d.value;
    });
    return map;
  }, [data]);

  // simple color scale
  const getFillColor = (value) => {
    if (value == null) return "#e5e7eb"; // gray for no data
    if (value > 100) return "#1d4ed8";
    if (value > 75) return "#3b82f6";
    if (value > 50) return "#93c5fd";
    return "#bfdbfe";
  };
  

  return (
    <div style={{ padding: 20 }}>
      <h1>World Map</h1>

      <ComposableMap projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryCode = geo.properties.ISO_A3;
              const countryName = geo.properties.NAME;
              const value = dataMap[countryCode];

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFillColor(value)}
                  onMouseEnter={() => {
                    setTooltip(
                      `${countryName} — ${
                        value != null ? value : "No data"
                      }`
                    );
                  }}
                  onMouseLeave={() => {
                    setTooltip("");
                  }}
                  onClick={() =>
                    navigate(`/country/${countryCode}`)
                  }
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "#f97316",
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      <Tooltip id="map-tooltip">{tooltip}</Tooltip>
    </div>
  );
}

export default WorldMapPage;
