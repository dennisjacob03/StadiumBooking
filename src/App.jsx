import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./Components/Home";
import Sign from "./Components/Sign/Sign"
import Signup from "./Components/Signup/Signup";
import AdminDash from "./Components/AdminDash/AdminDash";
import "react-toastify/dist/ReactToastify.css";
import StadiumDash from "./Components/StadiumDash/StadiumDash";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admindash" element={<AdminDash />} />
          <Route path="/stadiumdash" element={<StadiumDash />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
