import { BrowserRouter, Routes, Route } from "react-router-dom";
import Start from "./pages/Start";
import Competentiematrix from "./pages/competentiematrix/Competentiematrix";
import Beheer from "./pages/competentiematrix/Beheer";
import TraineeDashboard from "./pages/dashboard/trainee/Dashboard";
import LeidinggevendeDashboard from "./pages/dashboard/leidinggevende/Dashboard";
import BeheerDashboard from "./pages/dashboard/beheer/Dashboard";
import "./index.css";

function App() {
  const params = new URLSearchParams(window.location.search);
  const rol = params.get("role") || "trainee";

  return (
    <BrowserRouter basename="/lms-tilstra">
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/matrix" element={<Competentiematrix rol={rol} />} />
        <Route path="/beheer" element={<Beheer />} />
        <Route path="/dashboard/trainee" element={<TraineeDashboard />} />
        <Route
          path="/dashboard/leidinggevende"
          element={<LeidinggevendeDashboard />}
        />
        <Route path="/dashboard/beheer" element={<BeheerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
