import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";


const API =
  "http://127.0.0.1:8000/api";


function Caregiver() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem(
      "access"
    );


  const [username, setUsername] =
    useState("");

  const [connections, setConnections] =
    useState([]);

  const [patients, setPatients] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [patientDoses, setPatientDoses] =
    useState([]);


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

    loadData();

  }, []);


  const loadData = async () => {

    try {

      const [
        connectionResponse,
        patientResponse,
        notificationResponse,
      ] = await Promise.all([

        axios.get(
          `${API}/accounts/caregiver/connections/`,
          config
        ),

        axios.get(
          `${API}/accounts/caregiver/patients/`,
          config
        ),

        axios.get(
          `${API}/accounts/notifications/`,
          config
        ),

      ]);


      setConnections(
        connectionResponse.data
      );

      setPatients(
        patientResponse.data
      );

      setNotifications(
        notificationResponse.data
      );

    } catch (error) {

      console.error(error);

    }

  };


  const sendRequest =
    async () => {

      if (!username.trim()) {

        alert(
          "Enter caregiver username."
        );

        return;
      }


      try {

        await axios.post(
          `${API}/accounts/caregiver/request_connection/`,
          {
            caregiver_username:
              username.trim(),
          },
          config
        );


        alert(
          "Caregiver request sent."
        );

        setUsername("");

        loadData();

      } catch (error) {

        alert(
          error.response?.data?.error ||
          "Unable to send request."
        );

      }

    };


  const acceptRequest =
    async (id) => {

      try {

        await axios.post(
          `${API}/accounts/caregiver/${id}/accept/`,
          {},
          config
        );

        loadData();

      } catch (error) {

        console.error(error);

      }

    };


  const rejectRequest =
    async (id) => {

      try {

        await axios.post(
          `${API}/accounts/caregiver/${id}/reject/`,
          {},
          config
        );

        loadData();

      } catch (error) {

        console.error(error);

      }

    };


  const viewPatient =
    async (patient) => {

      try {

        const response =
          await axios.get(
            `${API}/accounts/caregiver/patient_doses/?patient_id=${patient.id}`,
            config
          );

        setSelectedPatient(
          patient
        );

        setPatientDoses(
          response.data
        );

      } catch (error) {

        alert(
          "Unable to load patient doses."
        );

      }

    };


  const markRead =
    async (id) => {

      try {

        await axios.post(
          `${API}/accounts/notifications/${id}/mark_read/`,
          {},
          config
        );

        loadData();

      } catch (error) {

        console.error(error);

      }

    };


  return (

    <div className="caregiver-page">

      <main
        style={{
          maxWidth: "1100px",
          margin: "auto",
          padding: "30px",
        }}
      >

        <button
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>


        <h1>
          Caregiver Mode
        </h1>


        <p>
          Manage caregiver connections
          and medication activity.
        </p>


        <section className="caregiver-card">

          <h2>
            Connect a Caregiver
          </h2>

          <p>
            Enter the caregiver's
            registered username.
          </p>


          <div className="caregiver-form">

            <input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Caregiver username"
            />

            <button
              onClick={
                sendRequest
              }
            >
              Send Request
            </button>

          </div>

        </section>


        <section className="caregiver-card">

          <h2>
            Connections
          </h2>


          {connections.length === 0 ? (

            <p>
              No connections yet.
            </p>

          ) : (

            connections.map(
              (connection) => (

                <div
                  className="connection-row"
                  key={connection.id}
                >

                  <div>

                    <strong>
                      Patient:{" "}
                      {
                        connection.patient_username
                      }
                    </strong>

                    <p>
                      Caregiver:{" "}
                      {
                        connection.caregiver_username
                      }
                    </p>

                    <span>
                      Status:{" "}
                      {connection.status}
                    </span>

                  </div>


                  {connection.status ===
                    "pending" && (

                      <div>

                        <button
                          onClick={() =>
                            acceptRequest(
                              connection.id
                            )
                          }
                        >
                          Accept
                        </button>


                        <button
                          onClick={() =>
                            rejectRequest(
                              connection.id
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}

                </div>

              )
            )

          )}

        </section>


        <section className="caregiver-card">

          <h2>
            Connected Patients
          </h2>


          {patients.length === 0 ? (

            <p>
              No connected patients.
            </p>

          ) : (

            patients.map(
              (patient) => (

                <div
                  className="patient-row"
                  key={patient.id}
                >

                  <div>

                    <strong>
                      {patient.username}
                    </strong>

                    <p>
                      {patient.email}
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      viewPatient(
                        patient
                      )
                    }
                  >
                    View Medication
                  </button>

                </div>

              )
            )

          )}

        </section>


        {selectedPatient && (

          <section className="caregiver-card">

            <h2>
              {selectedPatient.username}'s
              Medication History
            </h2>


            {patientDoses.length === 0 ? (

              <p>
                No dose records available.
              </p>

            ) : (

              patientDoses.map(
                (dose) => (

                  <div
                    className="dose-row"
                    key={dose.id}
                  >

                    <div>

                      <strong>
                        {dose.medicine_name}
                      </strong>

                      <p>
                        {dose.dosage}
                      </p>

                      <small>
                        {new Date(
                          dose.scheduled_at
                        ).toLocaleString()}
                      </small>

                    </div>


                    <span
                      className={
                        `status-badge ${dose.status}`
                      }
                    >
                      {dose.status}
                    </span>

                  </div>

                )
              )

            )}

          </section>

        )}


        <section className="caregiver-card">

          <h2>
            Notifications
          </h2>


          {notifications.length === 0 ? (

            <p>
              No notifications.
            </p>

          ) : (

            notifications.map(
              (notification) => (

                <div
                  className={
                    `notification-row ${notification.is_read
                      ? "read"
                      : ""
                    }`
                  }
                  key={
                    notification.id
                  }
                >

                  <p>
                    {notification.message}
                  </p>

                  <small>
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </small>


                  {!notification.is_read && (

                    <button
                      onClick={() =>
                        markRead(
                          notification.id
                        )
                      }
                    >
                      Mark Read
                    </button>

                  )}

                </div>

              )
            )

          )}

        </section>

      </main>

    </div>
  );
}


export default Caregiver;