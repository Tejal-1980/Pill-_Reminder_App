import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import "./history.css";


const API =
  "http://127.0.0.1:8000/api";


function History() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem(
      "access"
    );


  const [doses, setDoses] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  const config = {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };


  useEffect(() => {

    if (!token) {

      navigate("/");

      return;
    }

    fetchDoses();

  }, []);


  const fetchDoses = async () => {

    try {

      setLoading(true);

      const response =
        await axios.get(
          `${API}/doses/`,
          config
        );

      setDoses(
        response.data
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };


  const takeDose = async (
    id
  ) => {

    try {

      await axios.post(
        `${API}/doses/${id}/take/`,
        {},
        config
      );

      await fetchDoses();

    } catch (error) {

      alert(
        "Unable to mark dose as taken."
      );

    }

  };


  const skipDose = async (
    id
  ) => {

    try {

      await axios.post(
        `${API}/doses/${id}/skip/`,
        {},
        config
      );

      await fetchDoses();

    } catch (error) {

      alert(
        "Unable to skip dose."
      );

    }

  };


  const filteredDoses =
    doses.filter(
      (dose) =>
        dose.medicine_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  const total =
    doses.length;

  const taken =
    doses.filter(
      (dose) =>
        dose.status === "taken"
    ).length;

  const missed =
    doses.filter(
      (dose) =>
        dose.status === "missed"
    ).length;

  const pending =
    doses.filter(
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

      <header className="history-header">

        <div>

          <h1>
            Medicine History
          </h1>

          <p>
            Track your medication activity
          </p>

        </div>


        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Dashboard
        </button>

      </header>


      <main className="history-content">


        <div className="history-stats">

          <div>

            <span>
              Total
            </span>

            <strong>
              {total}
            </strong>

          </div>


          <div>

            <span>
              Taken
            </span>

            <strong>
              {taken}
            </strong>

          </div>


          <div>

            <span>
              Missed
            </span>

            <strong>
              {missed}
            </strong>

          </div>


          <div>

            <span>
              Pending
            </span>

            <strong>
              {pending}
            </strong>

          </div>


          <div>

            <span>
              Adherence
            </span>

            <strong>
              {adherence}%
            </strong>

          </div>

        </div>


        <input
          className="history-search"
          type="text"
          placeholder="Search medicine..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />


        {loading ? (

          <p>
            Loading medicine history...
          </p>

        ) : (

          <div className="dose-list">

            {filteredDoses.length === 0 ? (

              <div className="empty-history">

                <h3>
                  No dose records
                </h3>

                <p>
                  Today's doses will
                  appear here automatically.
                </p>

              </div>

            ) : (

              filteredDoses.map(
                (dose) => (

                  <div
                    className="dose-item"
                    key={dose.id}
                  >

                    <div>

                      <h3>
                        {dose.medicine_name}
                      </h3>

                      <p>
                        Dosage:{" "}
                        {dose.dosage}
                      </p>

                      <p>
                        Scheduled:{" "}
                        {new Date(
                          dose.scheduled_at
                        ).toLocaleString()}
                      </p>

                    </div>


                    <div className="dose-actions">

                      <span
                        className={
                          `status-badge ${dose.status}`
                        }
                      >
                        {dose.status}
                      </span>


                      {dose.status ===
                        "pending" && (

                          <>

                            <button
                              onClick={() =>
                                takeDose(
                                  dose.id
                                )
                              }
                            >
                              Take
                            </button>


                            <button
                              onClick={() =>
                                skipDose(
                                  dose.id
                                )
                              }
                            >
                              Skip
                            </button>

                          </>

                        )}

                    </div>

                  </div>

                )
              )

            )}

          </div>

        )}

      </main>

    </div>
  );
}


export default History;