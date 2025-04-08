import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

import { db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import "./OwnerDash.scss";
import Ownernavbar from "../Ownernavbar/Ownernavbar";

const OwnerDash = () => {
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
    <div className="owner-dash">
      <Ownernavbar></Ownernavbar>
      <div className="home-box">
        <div className="main-box">
          <div className="main 1">
            <h1>Stadiums</h1>
            <p>Manage Stadiums</p>
            <Link to="/Ownerstadiums" className="btn">
              View
            </Link>
          </div>
          <div className="main 2">
            <h1>Events</h1>
            <p>Manage Events</p>
            <Link to="/Ownerevents" className="btn">
              View
            </Link>
          </div>
          <div className="main 3">
            <h1>Category</h1>
            <p>Manage Category</p>
            <Link to="/Ownercategory" className="btn">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDash;
