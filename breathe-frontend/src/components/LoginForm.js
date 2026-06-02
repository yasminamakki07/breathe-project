import React, { useState } from "react";
import axios from "axios";

function LoginForm({ setUser }) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      window.location.href = "/breathing";
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <form className="form-box auth-form-box" onSubmit={handleSubmit}>
      <h3>Log In</h3>
      <input
        type="text"
        name="identifier"
        placeholder="Username or Email"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />
      <button type="submit">Log In</button>
      {message && <p className="error-message">{message}</p>}
    </form>
  );
}

export default LoginForm;