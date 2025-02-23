import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

import { db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import Adminnavbar from "../Adminnavbar/Adminnavbar";
import "./Admindash.css";
import logo from "../../assets/logowhite.png";
import user from "../../assets/user-default.png";

const AdminDash = () => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
				
        await setDoc(
          doc(db, "login", currentUser.uid),
          {
            login_time: serverTimestamp(),
          },
          { merge: true }
        );

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };

    fetchUserData();
  }, [currentUser]);
  const handleLogout = async () => {
    if (currentUser) {
      const userRef = doc(db, "login", currentUser.uid);

      try {
        // Store logout time in Firestore
        await setDoc(userRef, {
          logout_time: serverTimestamp(),
        });

        await logout();
        toast.success("Logged out successfully!");
      } catch (error) {
        toast.error("Error logging out: ", error);
      }
    }
  };
  return (
    <div className="admin-dash">
      <Adminnavbar></Adminnavbar>
      <div className="home-box">
        <div className="main-box">
          <div className="main 1">
            <h1>Users</h1>
            <p>Manage users</p>
            <Link to="/Users" className="btn">
              View
            </Link>
          </div>
          <div className="main 2">
            <h1>Events</h1>
            <p>Manage events</p>
            <Link to="/Events" className="btn">
              View
            </Link>
          </div>
          <div className="main 3">
            <h1>Stadiums</h1>
            <p>Manage Stadiums</p>
            <Link to="/Stadiums" className="btn">
              View
            </Link>
          </div>
          <div className="main 3">
            <h1>Bookings</h1>
            <p>Manage Bookings</p>
            <Link to="/Bookings" className="btn">
              View
            </Link>
          </div>
          <div className="main 3">
            <h1>Seats</h1>
            <p>Manage Seats</p>
            <Link to="/Seats" className="btn">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
