import Competentiematrix from "./pages/competentiematrix/Competentiematrix";
import "./index.css";

function App() {
  const params = new URLSearchParams(window.location.search);
  const rol = params.get("role") || "trainee";

  return <Competentiematrix rol={rol} />;
}

export default App;
