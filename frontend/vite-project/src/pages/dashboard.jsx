import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/medicines/",
        config
      );

      setMedicines(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const addMedicine = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/medicines/",
        {
          name,
          dosage,
          time,
          taken: false,
        },
        config
      );

      setName("");
      setDosage("");
      setTime("");

      fetchMedicines();
    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to add medicine");
    }
  };

  const deleteMedicine = async (id) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/medicines/${id}/`,
        config
      );

      fetchMedicines();
    } catch (error) {
      console.log(error);
    }
  };

  const markTaken = async (medicine) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/medicines/${medicine.id}/`,
        {
          ...medicine,
          taken: true,
        },
        config
      );

      fetchMedicines();
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const total = medicines.length;

  const takenCount = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const pending = total - takenCount;

  const adherence =
    total > 0
      ? Math.round((takenCount / total) * 100)
      : 0;

  if (!token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1>💊 Pill Reminder Dashboard</h1>
          <p className="subtitle">
            Stay healthy. Never miss a dose.
          </p>
        </div>

        <div className="header-buttons">
          <button
            className="history-btn"
            onClick={() => navigate("/history")}
          >
            📊 History
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="card">
          <h2>{total}</h2>
          <p>Total Medicines</p>
        </div>

        <div className="card">
          <h2>{takenCount}</h2>
          <p>Taken</p>
        </div>

        <div className="card">
          <h2>{pending}</h2>
          <p>Pending</p>
        </div>

        <div className="card">
          <h2>{adherence}%</h2>
          <p>Adherence Rate</p>
        </div>
      </div>

      <div className="add-section">
        <h2>Add Medicine</h2>

        <form onSubmit={addMedicine}>
          <input
            type="text"
            placeholder="Medicine Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <button type="submit">
            ➕ Add Medicine
          </button>
        </form>
      </div>

      <div className="medicine-list">
        <h2>My Medicines</h2>

        {medicines.length === 0 ? (
          <div className="empty-state">
            <h3>No Medicines Added Yet</h3>
            <p>
              Add your first medicine to begin tracking
              your health.
            </p>
          </div>
        ) : (
          medicines.map((medicine) => (
            <div
              className="medicine-card"
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

                <span
                  className={
                    medicine.taken
                      ? "status taken"
                      : "status pending"
                  }
                >
                  {medicine.taken
                    ? "✅ Taken"
                    : "⏳ Pending"}
                </span>
              </div>

              <div className="medicine-actions">
                {!medicine.taken && (
                  <button
                    className="taken-btn"
                    onClick={() => markTaken(medicine)}
                  >
                    Mark Taken
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteMedicine(medicine.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;