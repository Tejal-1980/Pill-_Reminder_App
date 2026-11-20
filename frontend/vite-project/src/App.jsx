import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import History from "./pages/history";
import Caregiver from "./pages/caregiver";
import BuyMedicine from "./pages/buyMedicine";


function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/caregiver"
          element={<Caregiver />}
        />

        <Route
          path="/buy-medicine"
          element={<BuyMedicine />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;