import { useState } from "react";
import { useNavigate } from "react-router-dom";


const medicines = [
  {
    id: 1,
    name: "Paracetamol",
    dosage: "500 mg",
    description:
      "Commonly used for pain and fever.",
    price: 30,
  },
  {
    id: 2,
    name: "Vitamin C",
    dosage: "500 mg",
    description:
      "Vitamin supplement.",
    price: 120,
  },
  {
    id: 3,
    name: "Calcium",
    dosage: "500 mg",
    description:
      "Calcium supplement.",
    price: 180,
  },
  {
    id: 4,
    name: "Multivitamin",
    dosage: "Daily",
    description:
      "General vitamin supplement.",
    price: 250,
  },
];


function BuyMedicine() {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);


  const filteredMedicines =
    medicines.filter((medicine) =>
      medicine.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );


  const addToCart = (medicine) => {

    setCart([
      ...cart,
      medicine,
    ]);

    alert(
      `${medicine.name} added to cart.`
    );

  };


  const total = cart.reduce(
    (sum, medicine) =>
      sum + medicine.price,
    0
  );


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
          Buy Medicine
        </h1>


        <p>
          Search and add medicines to your cart.
        </p>


        <input
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "12px",
            margin: "20px 0",
          }}
          placeholder="Search medicine..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
          }}
        >

          {filteredMedicines.map(
            (medicine) => (

              <div
                key={medicine.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "15px",
                }}
              >

                <h2>
                  {medicine.name}
                </h2>

                <p>
                  {medicine.dosage}
                </p>

                <p>
                  {medicine.description}
                </p>

                <strong>
                  ₹{medicine.price}
                </strong>


                <br />

                <button
                  onClick={() =>
                    addToCart(medicine)
                  }
                  style={{
                    marginTop: "15px",
                  }}
                >
                  Add to Cart
                </button>

              </div>

            )
          )}

        </div>


        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            marginTop: "30px",
          }}
        >

          <h2>
            Cart ({cart.length})
          </h2>


          {cart.length === 0 ? (

            <p>
              Your cart is empty.
            </p>

          ) : (

            <>

              {cart.map(
                (medicine, index) => (

                  <p key={index}>
                    {medicine.name} —
                    ₹{medicine.price}
                  </p>

                )
              )}


              <hr />


              <h3>
                Total: ₹{total}
              </h3>


              <button
                onClick={() =>
                  alert(
                    "Demo checkout. Payment integration can be added later."
                  )
                }
              >
                Checkout
              </button>

            </>

          )}

        </section>

      </div>

    </div>

  );
}


export default BuyMedicine;