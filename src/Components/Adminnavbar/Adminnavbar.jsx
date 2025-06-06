import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

import { db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import "./Adminnavbar.scss";
import logo from "../../assets/logowhite.png";
import user from "../../assets/user-default.png";

const Adminnavbar = () => {
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
    <div className="adminnavbar">
      <div className="navbar">
        <nav className="container dark-nav">
          <img src={logo} alt="SpotOn" className="logo" />
          <ul>
            <li>
              {/* <div className="main-search">
                <input type="search" placeholder="Search" />
                <button className="btn">Search</button>
              </div> */}
            </li>
            <li>
              {currentUser ? (
                <div className="user-info">
                  <span className="user">
                    {userData?.profile_pic ? (
                      <img src={userData?.profile_pic} alt="user" />
                    ) : (
                      <img src={user} alt="user" />
                    )}
                    Hi, {userData?.username || "Guest"}
                  </span>
                  <div className="on-hover">
                    <Link to="/adminprofile" className="profile-link">
                      My Profile
                    </Link>
                    <hr />
                    <Link to="/">
                      <button onClick={handleLogout} className="btn logout-btn">
                        Log Out
                      </button>
                    </Link>
                  </div>
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
      <div className="side-nav">
        <h2>Admin Dashboard</h2>
        <ul>
          <li>
            <Link to="/AdminDash" className="active">
              Home
            </Link>
          </li>
          <li>
            <Link to="/Users">Users</Link>
          </li>
          <li>
            <Link to="/Stadiums">Stadiums</Link>
          </li>
          <li>
            <Link to="/Events">Events</Link>
          </li>
          <li>
            <Link to="/admincategory">Category</Link>
          </li>
          <li>
            <Link to="/Seats">Seats</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Adminnavbar;
