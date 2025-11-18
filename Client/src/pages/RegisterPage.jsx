import React, { useState } from "react";
import { register } from "../utils/api.js";// your api helper
import { Link } from "react-router-dom"; // FIXED

export default function RegisterPage({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent GET refresh

    try {
      const res = await register(email, password, displayName);
      onRegisterSuccess(res);
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>
      </form>

      <p className="switch-auth">
        Already have an account? <Link to="/login">Login</Link> 
      </p>
    </div>
  );
}
