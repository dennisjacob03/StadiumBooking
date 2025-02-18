import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import Sign from "./Components/Sign/Sign"
import Signup from "./Components/Signup/Signup";
import AdminDash from "./Components/AdminDash/AdminDash";
import "react-toastify/dist/ReactToastify.css";
import OwnerDash from "./Components/OwnerDash/OwnerDash";
import Contact from "./Components/Contact/Contact";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admindash" element={<AdminDash />} />
          <Route path="/ownerdash" element={<OwnerDash />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
