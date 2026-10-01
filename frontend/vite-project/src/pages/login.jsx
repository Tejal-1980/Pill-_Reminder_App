import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/accounts/login/",
        {
          username,
          password,
        }
      );

      localStorage.setItem(
        "access",
        response.data.access
      );

      localStorage.setItem(
        "refresh",
        response.data.refresh
      );

      navigate("/dashboard");

    } catch (error) {
      console.log(error);

      setError(
        "Invalid username or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-left">
        <div>

          <h1>
            💊 Pill Reminder
          </h1>

          <p>
            Stay on schedule.
            <br />
            Stay healthy.
          </p>

        </div>
      </div>


      <div className="auth-right">

        <div className="auth-card">

          <h2>
            Welcome Back
          </h2>

          <p className="auth-subtitle">
            Login to manage your medicines.
          </p>


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          <form onSubmit={handleLogin}>

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              className="auth-input"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              className="auth-input"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />


            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>


          <p className="auth-text">
            Don't have an account?{" "}

            <Link to="/register">
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;