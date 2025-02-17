import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Stadiumdash.css";
import logo from "../../assets/logowhite.png";
import user from "../../assets/user-default.png";

const StadiumDash = () => {
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

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="stadium-dash">
      <div className="navbar">
        <nav className="container dark-nav">
          <img src={logo} alt="SpotOn" className="logo" />
          <ul>
            <li>
              <div className="main-search">
                <input type="search" placeholder="Search" />
                <button className="btn">Search</button>
              </div>
            </li>
            <li>
              {currentUser ? (
                <div className="user-info">
                  <span className="user">
                    <img src={user} alt="user" />
                    Hi, {userData?.fullName || "Guest"}
                  </span>
                  <div className="on-hover">
                    <Link to="/Myprofile" className="profile-link">
                      My Profile
                    </Link>
                    <hr />
                    <button onClick={logout} className="btn logout-btn">
                      Log Out
                    </button>
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
        <h2>Stadium Dashboard</h2>
        <ul>
          <li>
            <Link to="/StadiumDash" className="active">
              Home
            </Link>
          </li>
          <li>
            <Link to="/Stadiums">Stadiums</Link>
          </li>
          <li>
            <Link to="/Events">Events</Link>
          </li>
          <li>
            <Link to="/Tickets">Tickets</Link>
          </li>
        </ul>
      </div>
      <div className="home-box">
        <div className="main-box">
          <div className="main 1">
            <h1>Stadiums</h1>
            <p>Manage stadiums</p>
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
            <h1>Tickets</h1>
            <p>Manage tickets</p>
            <Link to="/Tickets" className="btn">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumDash;
