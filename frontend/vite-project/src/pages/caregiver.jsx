import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const API = "http://127.0.0.1:8000/api";


function Caregiver() {

  const navigate = useNavigate();

  const token = localStorage.getItem("access");

  const [username, setUsername] = useState("");

  const [connections, setConnections] =
    useState([]);

  const [patients, setPatients] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);


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


  const requestCaregiver = async () => {

    if (!username.trim()) {

      alert(
        "Enter the caregiver username."
      );

      return;
    }


    try {

      await axios.post(
        `${API}/accounts/caregiver/request_connection/`,
        {
          caregiver_username: username,
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


  const acceptConnection = async (id) => {

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


  const rejectConnection = async (id) => {

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


  const markRead = async (id) => {

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

    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
      }}
    >

      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
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
          Connect with a caregiver and monitor
          medication activity.
        </p>


        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            marginTop: "25px",
          }}
        >

          <h2>
            Connect Caregiver
          </h2>

          <p>
            Enter the caregiver's registered username.
          </p>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Caregiver username"
            />

            <button
              onClick={requestCaregiver}
            >
              Send Request
            </button>

          </div>

        </section>


        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            marginTop: "25px",
          }}
        >

          <h2>
            Connections
          </h2>


          {connections.length === 0 ? (

            <p>
              No caregiver connections yet.
            </p>

          ) : (

            connections.map((connection) => (

              <div
                key={connection.id}
                style={{
                  padding: "15px",
                  borderBottom:
                    "1px solid #eee",
                }}
              >

                <strong>
                  Patient:{" "}
                  {connection.patient_username}
                </strong>

                <p>
                  Caregiver:{" "}
                  {connection.caregiver_username}
                </p>

                <p>
                  Status:{" "}
                  {connection.status}
                </p>


                {connection.status === "pending" && (

                  <div>

                    <button
                      onClick={() =>
                        acceptConnection(
                          connection.id
                        )
                      }
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        rejectConnection(
                          connection.id
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                )}

              </div>

            ))

          )}

        </section>


        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            marginTop: "25px",
          }}
        >

          <h2>
            Connected Patients
          </h2>


          {patients.length === 0 ? (

            <p>
              No connected patients.
            </p>

          ) : (

            patients.map((patient) => (

              <div
                key={patient.id}
                style={{
                  padding: "15px",
                  borderBottom:
                    "1px solid #eee",
                }}
              >

                <strong>
                  {patient.username}
                </strong>

                <p>
                  {patient.email}
                </p>

              </div>

            ))

          )}

        </section>


        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            marginTop: "25px",
          }}
        >

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
                  key={notification.id}
                  style={{
                    padding: "15px",
                    borderBottom:
                      "1px solid #eee",
                    opacity:
                      notification.is_read
                        ? 0.6
                        : 1,
                  }}
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

      </div>

    </div>

  );
}


export default Caregiver;