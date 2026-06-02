import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Breathe</h2>
      <div className="nav-links">
        <Link to="/breathing">Breathing Exercise</Link>
        <Link to="/progress">Progress</Link>
        <button onClick={handleLogout} className="logout-btn">Log Out</button>
      </div>
    </nav>
  );
}

export default Navbar;