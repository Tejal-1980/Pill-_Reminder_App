import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import "./Auth.css";


function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/accounts/register/",
        {
          username,
          email,
          password,
        }
      );

      navigate("/");

    } catch (error) {
      const data = error.response?.data;

      if (data?.username) {
        setError(
          data.username[0]
        );
      } else if (data?.email) {
        setError(
          data.email[0]
        );
      } else if (data?.password) {
        setError(
          data.password[0]
        );
      } else {
        setError(
          "Registration failed."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-container">

      <div className="auth-left">
        <div>
          <h1>💊 Pill Reminder</h1>

          <p>
            Your medication,
            <br />
            organized.
          </p>
        </div>
      </div>


      <div className="auth-right">

        <div className="auth-card">

          <h2>Create Account</h2>

          <p className="auth-subtitle">
            Start managing your medicines.
          </p>


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          <form onSubmit={handleRegister}>

            <label>
              Username
            </label>

            <input
              type="text"
              placeholder="Choose username"
              className="auth-input"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />


            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              className="auth-input"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Minimum 8 characters"
              className="auth-input"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={8}
              required
            />


            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>

          </form>


          <p className="auth-text">
            Already have an account?{" "}
            <Link to="/">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}


export default Register;