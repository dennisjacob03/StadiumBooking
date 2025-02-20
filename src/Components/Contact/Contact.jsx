import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Contact.css";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="contact container">
      <Navbar></Navbar>
      <div className="contact-page">
        <div className="contact-bg">
          <h1>Contact Us</h1>
        </div>
        <div className="contact-details">
          <form>
            <div className="section all-data">
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

export default Contact;
