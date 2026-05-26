import { BrowserRouter, Routes, Route } from "react-router-dom";
import Competentiematrix from "./pages/competentiematrix/Competentiematrix";
import Beheer from "./pages/competentiematrix/Beheer";
import "./index.css";

function App() {
  const params = new URLSearchParams(window.location.search);
  const rol = params.get("role") || "trainee";

  return (
    <BrowserRouter basename="/lms-tilstra">
      <Routes>
        <Route path="/" element={<Competentiematrix rol={rol} />} />
        <Route path="/beheer" element={<Beheer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
