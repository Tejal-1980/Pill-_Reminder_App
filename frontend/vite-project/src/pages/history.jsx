import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import "./history.css";

function History() {
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/medicines/"
        );


        setMedicines(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    loadMedicines();
  }, []);

  if (!token) {
    return <Navigate to="/" />;
  }

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const total = medicines.length;

  const taken = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const pending = total - taken;

  const adherence =
    total > 0
      ? Math.round((taken / total) * 100)
      : 0;

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>📊 Medication History</h1>
          <p>
            View all medicines and adherence
            statistics
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
          <p>Total Medicines</p>
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
          <p>Adherence Rate</p>
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
        <h2>Medicine Records</h2>

        {filteredMedicines.length === 0 ? (
          <div className="no-data">
            <h3>No Medicines Found</h3>
          </div>
        ) : (
          filteredMedicines.map((medicine) => (
            <div
              className="history-item"
              key={medicine.id}
            >
              <div>
                <h3>{medicine.name}</h3>

                <p>
                  <strong>Dosage:</strong>{" "}
                  {medicine.dosage}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {medicine.time}
                </p>
              </div>

              <div>
                {medicine.taken ? (
                  <span className="taken-badge">
                    ✓ Taken
                  </span>
                ) : (
                  <span className="pending-badge">
                    ⏳ Pending
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default History;