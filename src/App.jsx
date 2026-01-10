import { Routes, Route } from "react-router-dom";
import WorldMapPage from "./pages/WorldMapPage";
import CountryPage from "./pages/CountryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WorldMapPage />} />
      <Route path="/country/:countryName" element={<CountryPage />} />
    </Routes>
  );
}


export default App;
