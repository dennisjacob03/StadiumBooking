import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase"; // Import Firestore
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import "./Navbar.css";
import logo from "../../assets/logowhite.png";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="navbar">
      <nav className="container">
        <img src={logo} alt="SpotOn" className="logo" />
        <ul>
          <li>Explore</li>
          <li>My Tickets</li>
          <li>Contact</li>
          <li>
            {currentUser ? (
              <div className="user-info">
                <span className="username">
                  {userData?.fullName || ""}
                </span>
                <button onClick={logout} className="btn logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/Sign">
                <button className="btn">SIGN IN</button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
