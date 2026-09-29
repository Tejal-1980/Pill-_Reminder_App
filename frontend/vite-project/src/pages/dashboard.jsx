import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import "./Dashboard.css";


const API = "http://127.0.0.1:8000/api";


function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const [medicines, setMedicines] = useState([]);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [instructions, setInstructions] = useState("");

  const [loading, setLoading] = useState(false);


  const fetchMedicines = async () => {
    try {
      const response = await axios.get(
        `${API}/medicines/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMedicines(response.data);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    let cancelled = false;

    const loadMedicines = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(
          `${API}/medicines/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setMedicines(response.data);
        }

      } catch (error) {
        console.log(error);
      }
    };

    loadMedicines();

    return () => {
      cancelled = true;
    };
  }, [token]);


  const addMedicine = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const medicineResponse =
        await axios.post(
          `${API}/medicines/`,
          {
            name,
            dosage,
            start_date: today,
            instructions,
            is_active: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


      await axios.post(
        `${API}/schedules/`,
        {
          medicine:
            medicineResponse.data.id,
          time,
          frequency: "daily",
          is_active: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setName("");
      setDosage("");
      setTime("");
      setInstructions("");

      await fetchMedicines();

    } catch (error) {
      console.log(
        error.response?.data
      );

      alert(
        "Failed to add medicine."
      );

    } finally {
      setLoading(false);
    }
  };


  const deleteMedicine = async (id) => {
    if (
      !window.confirm(
        "Delete this medicine?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API}/medicines/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchMedicines();

    } catch (error) {
      console.log(error);
    }
  };


  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");
  };


  if (!token) {
    navigate("/");
    return null;
  }


  const total = medicines.length;

  const activeMedicines =
    medicines.filter(
      (medicine) =>
        medicine.is_active
    ).length;


  const dailySchedules =
    medicines.reduce(
      (count, medicine) =>
        count +
        (medicine.schedules?.length || 0),
      0
    );


  return (
    <div className="dashboard">

      <header className="header">

        <div>
          <h1>
            💊 Pill Reminder
          </h1>

          <p className="subtitle">
            Stay healthy. Never miss a dose.
          </p>
        </div>


        <div className="header-buttons">

          <button
            className="history-btn"
            onClick={() =>
              navigate("/history")
            }
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

      </header>


      <section className="stats">

        <div className="card">
          <h2>{total}</h2>
          <p>Total Medicines</p>
        </div>

        <div className="card">
          <h2>{activeMedicines}</h2>
          <p>Active Medicines</p>
        </div>

        <div className="card">
          <h2>{dailySchedules}</h2>
          <p>Daily Schedules</p>
        </div>

        <div className="card">
          <h2>100%</h2>
          <p>Health Tracking</p>
        </div>

      </section>


      <section className="add-section">

        <h2>
          ➕ Add Medicine
        </h2>

        <form onSubmit={addMedicine}>

          <input
            type="text"
            placeholder="Medicine name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) =>
              setDosage(e.target.value)
            }
            required
          />

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Instructions (optional)"
            value={instructions}
            onChange={(e) =>
              setInstructions(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Adding..."
              : "Add Medicine"}
          </button>

        </form>

      </section>


      <section className="medicine-list">

        <h2>
          My Medicines
        </h2>


        {medicines.length === 0 ? (

          <div className="empty-state">

            <h3>
              No Medicines Added Yet
            </h3>

            <p>
              Add your first medicine
              to start tracking.
            </p>

          </div>

        ) : (

          medicines.map(
            (medicine) => (

              <div
                className="medicine-card"
                key={medicine.id}
              >

                <div>

                  <h3>
                    {medicine.name}
                  </h3>

                  <p>
                    <strong>
                      Dosage:
                    </strong>{" "}
                    {medicine.dosage}
                  </p>


                  {medicine.schedules?.map(
                    (schedule) => (

                      <p
                        key={schedule.id}
                      >
                        <strong>
                          Time:
                        </strong>{" "}
                        {schedule.time}
                      </p>

                    )
                  )}


                  {medicine.instructions && (
                    <p>
                      <strong>
                        Instructions:
                      </strong>{" "}
                      {medicine.instructions}
                    </p>
                  )}


                  <span
                    className={
                      medicine.is_active
                        ? "status taken"
                        : "status pending"
                    }
                  >
                    {medicine.is_active
                      ? "● Active"
                      : "● Inactive"}
                  </span>

                </div>


                <div className="medicine-actions">

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteMedicine(
                        medicine.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )

        )}

      </section>

    </div>
  );
}


export default Dashboard;