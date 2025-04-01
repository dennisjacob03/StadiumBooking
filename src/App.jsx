import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import Sign from "./Components/Sign/Sign"
import Signup from "./Components/Signup/Signup";
import "react-toastify/dist/ReactToastify.css";
import AdminDash from "./Components/AdminDash/AdminDash";
import Adminnavbar from "./Components/Adminnavbar/Adminnavbar";
import OwnerDash from "./Components/OwnerDash/OwnerDash";
import Ownernavbar from "./Components/Ownernavbar/Ownernavbar";
import Contact from "./Components/Contact/Contact";
import Bookings from "./Components/Bookings/Bookings";
import Users from "./Components/Users/Users";
import Events from "./Components/Events/Events";
import Stadiums from "./Components/Stadiums/Stadiums"
import Seats from "./Components/Seats/Seats"
import Ownerevents from "./Components/Ownerevents/Ownerevents";
import Ownerstadiums from "./Components/Ownerstadiums/Ownerstadiums";
import 	Ownerbookings from "./Components/Ownerbookings/Ownerbookings";
import 	Ownerseats from "./Components/Ownerseats/Ownerseats";
import Eventdetails from "./Components/Eventdetails/Eventdetails";
import Ownerprofile from "./Components/Ownerprofile/Ownerprofile";
import Adminprofile from "./Components/Adminprofile/Adminprofile";
import Stadiumbook from "./Components/Stadiumbook/Stadiumbook";
import Ownercategory from "./Components/Ownercategory/Ownercategory";
import Admincategory from "./Components/Admincategory/Admincategory";
import Stadiumrgics from "./Components/Stadiumrgics/Stadiumrgics"
import Seatbook from "./Components/Seatbook/Seatbook";
import PhoneVerification from "./Components/PhoneVerification/PhoneVerification";

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
          <Route path="/adminnavbar" element={<Adminnavbar />} />
          <Route path="/ownernavbar" element={<Ownernavbar />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/users" element={<Users />} />
          <Route path="/events" element={<Events />} />
          <Route path="/stadiums" element={<Stadiums />} />
          <Route path="/seats" element={<Seats />} />
          <Route path="/Ownerevents" element={<Ownerevents />} />
          <Route path="/ownerstadiums" element={<Ownerstadiums />} />
          <Route path="/ownerbookings" element={<Ownerbookings />} />
          <Route path="/ownerseats" element={<Ownerseats />} />
          <Route path="/eventdetails/:eventId" element={<Eventdetails />} />
          <Route path="/ownerprofile" element={<Ownerprofile />} />
          <Route path="/adminprofile" element={<Adminprofile />} />
          <Route path="/stadiumbook/:eventId" element={<Stadiumbook />} />
          <Route path="/ownercategory" element={<Ownercategory />} />
          <Route path="/admincategory" element={<Admincategory />} />
          <Route path="/stadiumrgics" element={<Stadiumrgics />} />
          <Route path="/seatbook/:eventId/:categoryId" element={<Seatbook />} />
          <Route path="/phoneverification" element={<PhoneVerification />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
