import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <main className="w-screen h-screen relative pointer-events-none">
        <AppRoutes />
        <Navbar />
      </main>
    </Router>
  );
}

export default App;
