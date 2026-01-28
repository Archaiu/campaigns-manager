import { useState } from "react";
import apiClient from "../utils/apiClient";

function RegisterForm({ setView, setMessage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    if (password.length < 3) {
      setError("Hasło musi mieć minimum 3 znaki");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/register", { username, password });
      setMessage("Konto zostało utworzone! Możesz się teraz zalogować.");
      setView("login");
    } catch (err) {
      setError(err.message || "Nie można utworzyć konta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Rejestracja</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nazwa użytkownika</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Wprowadź nazwę użytkownika"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wprowadź hasło"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Wprowadź hasło ponownie"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </button>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setView("login")}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#007bff", 
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Masz już konto? Zaloguj się
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
