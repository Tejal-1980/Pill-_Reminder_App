import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";


const products = [
  {
    id: 1,
    name: "Paracetamol",
    dosage: "500 mg",
    price: 30,
    description:
      "Medicine product listing.",
  },

  {
    id: 2,
    name: "Vitamin C",
    dosage: "500 mg",
    price: 120,
    description:
      "Vitamin supplement listing.",
  },

  {
    id: 3,
    name: "Calcium",
    dosage: "500 mg",
    price: 180,
    description:
      "Calcium supplement listing.",
  },

  {
    id: 4,
    name: "Multivitamin",
    dosage: "Daily",
    price: 250,
    description:
      "Multivitamin product listing.",
  },
];


function BuyMedicine() {

  const navigate = useNavigate();

  const [search, setSearch] =
    useState("");

  const [cart, setCart] =
    useState([]);


  const filteredProducts =
    products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  const addToCart =
    (product) => {

      setCart([
        ...cart,
        product,
      ]);

    };


  const removeFromCart =
    (index) => {

      setCart(
        cart.filter(
          (_, i) =>
            i !== index
        )
      );

    };


  const total =
    cart.reduce(
      (sum, product) =>
        sum + product.price,
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

      <main
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
          Search available medicine products.
        </p>


        <input
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "13px",
            margin:
              "20px 0",
            border:
              "1px solid #ddd",
            borderRadius:
              "8px",
          }}
          placeholder="Search medicine..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
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

          {filteredProducts.map(
            (product) => (

              <div
                key={product.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "15px",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,.05)",
                }}
              >

                <h2>
                  {product.name}
                </h2>

                <p>
                  {product.dosage}
                </p>

                <p>
                  {product.description}
                </p>

                <strong>
                  ₹{product.price}
                </strong>


                <br />


                <button
                  style={{
                    marginTop: "15px",
                  }}
                  onClick={() =>
                    addToCart(
                      product
                    )
                  }
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
            marginTop: "30px",
            padding: "25px",
            borderRadius: "15px",
          }}
        >

          <h2>
            Cart ({cart.length})
          </h2>


          {cart.length === 0 ? (

            <p>
              Cart is empty.
            </p>

          ) : (

            <>

              {cart.map(
                (
                  product,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding:
                        "10px 0",
                    }}
                  >

                    <span>
                      {product.name}
                    </span>

                    <span>
                      ₹{product.price}
                    </span>

                    <button
                      onClick={() =>
                        removeFromCart(
                          index
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}


              <hr />


              <h3>
                Total: ₹{total}
              </h3>


              <button
                onClick={() =>
                  alert(
                    "Demo checkout. Real pharmacy/payment integration can be connected later."
                  )
                }
              >
                Checkout
              </button>

            </>

          )}

        </section>

      </main>

    </div>
  );
}


export default BuyMedicine;