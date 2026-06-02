import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import BreathingPage from "./pages/BreathingPage";
import ProgressPage from "./pages/ProgressPage";
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  return (
    <Router>
      <div className="app-shell">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<WelcomePage setUser={setUser} />} />
            <Route
              path="/breathing"
              element={user ? <BreathingPage user={user} setUser={setUser} /> : <Navigate to="/" />}
            />
            <Route
              path="/progress"
              element={user ? <ProgressPage user={user} setUser={setUser} /> : <Navigate to="/" />}
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;