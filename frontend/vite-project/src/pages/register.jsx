import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Auth.css";


const API =
  "http://127.0.0.1:8000/api";


function Register() {

  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("patient");

  const [error, setError] =
    useState("");


  const handleRegister = async (event) => {

    event.preventDefault();

    setError("");


    try {

      await axios.post(
        `${API}/accounts/register/`,
        {
          username,
          email,
          password,
          role,
        }
      );


      alert(
        "Registration successful."
      );

      navigate("/");

    } catch (error) {

      const data =
        error.response?.data;

      setError(
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.error ||
        "Registration failed."
      );

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>
          Create Account
        </h1>

        <p>
          Start managing your medicines.
        </p>


        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            required
          />


          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >

            <option value="patient">
              Patient
            </option>

            <option value="caregiver">
              Caregiver
            </option>

          </select>


          {error && (
            <p className="error">
              {error}
            </p>
          )}


          <button type="submit">
            Register
          </button>

        </form>


        <p>

          Already have an account?{" "}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >
            Login
          </button>

        </p>

      </div>

    </div>

  );
}


export default Register;