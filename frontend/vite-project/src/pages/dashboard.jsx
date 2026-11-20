import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const [editingMedicine, setEditingMedicine] =
    useState(null);

  const [loading, setLoading] = useState(false);


  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  useEffect(() => {

    if (!token) {
      navigate("/");
      return;
    }

    fetchMedicines();

  }, []);


  const fetchMedicines = async () => {

    try {

      const response = await axios.get(
        `${API}/medicines/`,
        config
      );

      setMedicines(response.data);

    } catch (error) {

      console.error(error);

    }

  };


  const resetForm = () => {

    setName("");
    setDosage("");
    setTime("");
    setInstructions("");
    setEditingMedicine(null);

  };


  const saveMedicine = async (event) => {

    event.preventDefault();

    if (!name || !dosage || !time) {

      alert(
        "Please enter medicine name, dosage and time."
      );

      return;
    }


    setLoading(true);

    try {

      const medicineData = {
        name,
        dosage,
        start_date:
          new Date().toISOString().split("T")[0],
        instructions,
        is_active: true,
      };


      let medicine;


      if (editingMedicine) {

        const response = await axios.put(
          `${API}/medicines/${editingMedicine.id}/`,
          medicineData,
          config
        );

        medicine = response.data;

      } else {

        const response = await axios.post(
          `${API}/medicines/`,
          medicineData,
          config
        );

        medicine = response.data;

      }


      if (editingMedicine) {

        const schedule =
          editingMedicine.schedules?.[0];

        if (schedule) {

          await axios.put(
            `${API}/schedules/${schedule.id}/`,
            {
              medicine: medicine.id,
              time,
              frequency: "daily",
              is_active: true,
            },
            config
          );

        } else {

          await axios.post(
            `${API}/schedules/`,
            {
              medicine: medicine.id,
              time,
              frequency: "daily",
              is_active: true,
            },
            config
          );

        }

      } else {

        await axios.post(
          `${API}/schedules/`,
          {
            medicine: medicine.id,
            time,
            frequency: "daily",
            is_active: true,
          },
          config
        );

      }


      resetForm();

      await fetchMedicines();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to save medicine."
      );

    } finally {

      setLoading(false);

    }

  };


  const deleteMedicine = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?"
    );

    if (!confirmed) return;


    try {

      await axios.delete(
        `${API}/medicines/${id}/`,
        config
      );

      fetchMedicines();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to delete medicine."
      );

    }

  };


  const editMedicine = (medicine) => {

    setEditingMedicine(medicine);

    setName(medicine.name);
    setDosage(medicine.dosage);
    setInstructions(
      medicine.instructions || ""
    );

    setTime(
      medicine.schedules?.[0]?.time?.slice(0, 5) || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  const takeDose = async (doseId) => {

    try {

      await axios.post(
        `${API}/doses/${doseId}/take/`,
        {},
        config
      );

      alert("Medicine marked as taken.");

    } catch (error) {

      console.error(error);

      alert(
        "Unable to update dose."
      );

    }

  };


  const logout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");

  };


  const total = medicines.length;

  const active = medicines.filter(
    (medicine) => medicine.is_active
  ).length;

  const schedules = medicines.reduce(
    (total, medicine) =>
      total + (medicine.schedules?.length || 0),
    0
  );


  return (

    <div className="dashboard-page">

      <header className="dashboard-header">

        <div>
          <h1>💊 Pill Reminder</h1>
          <p>Smart Medication Management</p>
        </div>


        <div className="header-actions">

          <button
            onClick={() =>
              navigate("/caregiver")
            }
          >
            Caregiver
          </button>

          <button
            onClick={() =>
              navigate("/buy-medicine")
            }
          >
            Buy Medicine
          </button>

          <button
            onClick={() =>
              navigate("/history")
            }
          >
            History
          </button>

          <button
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </header>


      <main className="dashboard-content">


        <section className="stats-grid">

          <div className="stat-card">
            <h3>Total Medicines</h3>
            <strong>{total}</strong>
          </div>

          <div className="stat-card">
            <h3>Active Medicines</h3>
            <strong>{active}</strong>
          </div>

          <div className="stat-card">
            <h3>Schedules</h3>
            <strong>{schedules}</strong>
          </div>

        </section>


        <section className="add-medicine-section">

          <h2>
            {editingMedicine
              ? "Edit Medicine"
              : "Add Medicine"}
          </h2>


          <form
            className="medicine-form"
            onSubmit={saveMedicine}
          >

            <input
              type="text"
              placeholder="Medicine name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />


            <input
              type="text"
              placeholder="Dosage e.g. 500 mg"
              value={dosage}
              onChange={(e) =>
                setDosage(e.target.value)
              }
            />


            <input
              type="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
            />


            <input
              type="text"
              placeholder="Instructions"
              value={instructions}
              onChange={(e) =>
                setInstructions(e.target.value)
              }
            />


            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingMedicine
                  ? "Update Medicine"
                  : "Add Medicine"}
            </button>


            {editingMedicine && (

              <button
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>

            )}

          </form>

        </section>


        <section className="medicine-section">

          <h2>Your Medicines</h2>


          {medicines.length === 0 ? (

            <div className="empty-state">

              <h3>No medicines yet</h3>

              <p>
                Add your first medicine above.
              </p>

            </div>

          ) : (

            <div className="medicine-grid">

              {medicines.map((medicine) => (

                <article
                  className="medicine-card"
                  key={medicine.id}
                >

                  <div className="medicine-card-header">

                    <div>

                      <h3>
                        {medicine.name}
                      </h3>

                      <p>
                        {medicine.dosage}
                      </p>

                    </div>


                    <span
                      className={
                        medicine.is_active
                          ? "active-badge"
                          : "inactive-badge"
                      }
                    >
                      {medicine.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>


                  <div className="medicine-info">

                    <strong>
                      Schedule
                    </strong>

                    {medicine.schedules?.map(
                      (schedule) => (

                        <p key={schedule.id}>
                          ⏰{" "}
                          {schedule.time.slice(0, 5)}
                        </p>

                      )
                    )}

                  </div>


                  {medicine.instructions && (

                    <p className="instructions">
                      <strong>
                        Instructions:
                      </strong>{" "}
                      {medicine.instructions}
                    </p>

                  )}


                  <div className="medicine-actions">

                    <button
                      onClick={() =>
                        editMedicine(medicine)
                      }
                    >
                      Edit
                    </button>


                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteMedicine(medicine.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>

  );
}


export default Dashboard;