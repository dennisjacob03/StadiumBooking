import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Profile.css";
import user from "../../assets/user-default.png";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div className="profile container">
      <Navbar></Navbar>
      <div className="profile-page">
        <div className="profile-bg">
          <h1>My Profile</h1>
        </div>
        <div className="profile-details">
          <div className="section manage">
            <div className="profile-img">
              <img src={user} alt="Profile" />
            </div>
            <h3>Hi, John Doe</h3>
            <div className="manage-links">
              <button type="button" className="btn">
                Edit Profile
              </button>
              <Link to="/">
                <button type="button" className="btn">
                  Log Out
                </button>
              </Link>
            </div>
          </div>
          <hr />
          <form>
            <div className="section account-data">
              <div className="data">
                <label>Full Name:</label>
                <input type="text" value="John Doe" />
              </div>
              <div className="data">
                <label>Email:</label>
                <input type="text" value="John Doe" />
              </div>
              <div className="data">
                <label>Phone:</label>
                <input type="text" value="John Doe" />
              </div>
              <div className="data">
                <label>Address:</label>
                <input type="text" value="John Doe" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Profile;
