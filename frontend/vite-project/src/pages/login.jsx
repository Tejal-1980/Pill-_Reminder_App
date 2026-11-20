import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Auth.css";


const API =
  "http://127.0.0.1:8000/api";


function Login() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");

    setLoading(true);


    try {

      const response = await axios.post(
        `${API}/accounts/login/`,
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

      setError(
        "Invalid username or password."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>
          💊 Pill Reminder
        </h1>

        <p>
          Never miss a dose again.
        </p>


        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {error && (
            <p className="error">
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        <p>
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </button>

        </p>

      </div>

    </div>

  );
}


export default Login;