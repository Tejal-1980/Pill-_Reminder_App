import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  Navigate,
} from "react-router-dom";

import axios from "axios";

import "./history.css";


const API = "http://127.0.0.1:8000/api";


function History() {
  const token = localStorage.getItem("access");

  const navigate = useNavigate();

  const [doses, setDoses] = useState([]);
  const [search, setSearch] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  useEffect(() => {
    const loadDoses = async () => {
      try {
        const response =
          await axios.get(
            `${API}/doses/`,
            config
          );

        setDoses(response.data);

      } catch (error) {
        console.log(error);
      }
    };

    if (token) {
      loadDoses();
    }
  }, []);


  if (!token) {
    return <Navigate to="/" />;
  }


  const filteredDoses =
    doses.filter((dose) =>
      dose.medicine_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  const total = doses.length;

  const taken = doses.filter(
    (dose) =>
      dose.status === "taken"
  ).length;

  const missed = doses.filter(
    (dose) =>
      dose.status === "missed"
  ).length;

  const pending = doses.filter(
    (dose) =>
      dose.status === "pending"
  ).length;

  const adherence =
    total > 0
      ? Math.round(
        (taken / total) * 100
      )
      : 0;


  return (
    <div className="history-page">

      <div className="history-header">

        <div>
          <h1>
            📊 Medication History
          </h1>

          <p>
            Track your medication doses
            and adherence.
          </p>
        </div>


        <button
          className="back-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </div>


      <div className="history-stats">

        <div className="history-card">
          <h2>{total}</h2>
          <p>Total Doses</p>
        </div>

        <div className="history-card">
          <h2>{taken}</h2>
          <p>Taken</p>
        </div>

        <div className="history-card">
          <h2>{pending}</h2>
          <p>Pending</p>
        </div>

        <div className="history-card">
          <h2>{adherence}%</h2>
          <p>Adherence</p>
        </div>

      </div>


      <div className="search-section">

        <input
          type="text"
          placeholder="🔍 Search medicine..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>


      <div className="history-list">

        <h2>
          Dose Records
        </h2>


        {filteredDoses.length === 0 ? (

          <div className="no-data">
            <h3>
              No Dose Records Found
            </h3>
          </div>

        ) : (

          filteredDoses.map(
            (dose) => (

              <div
                className="history-item"
                key={dose.id}
              >

                <div>

                  <h3>
                    {dose.medicine_name}
                  </h3>

                  <p>
                    <strong>
                      Dosage:
                    </strong>{" "}
                    {dose.dosage}
                  </p>

                  <p>
                    <strong>
                      Scheduled:
                    </strong>{" "}
                    {new Date(
                      dose.scheduled_at
                    ).toLocaleString()}
                  </p>

                </div>


                <div>

                  {dose.status ===
                    "taken" ? (

                    <span className="taken-badge">
                      ✓ Taken
                    </span>

                  ) : dose.status ===
                    "missed" ? (

                    <span className="missed-badge">
                      ✕ Missed
                    </span>

                  ) : (

                    <span className="pending-badge">
                      ⏳{" "}
                      {dose.status}
                    </span>

                  )}

                </div>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}


export default History;