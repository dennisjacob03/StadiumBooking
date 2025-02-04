import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/logowhite.png"

export const Footer = () => {
  return (
    <div className="footer">
      <div className="foot">
        <div className="main-foot">
          <div className="logo">
            <a href="home.html" target="_blank">
              <img src={logo} alt="SpotOn" className="logo" />
            </a>
          </div>
          <p>© 2025 SpotOn. All Rights Reserved.</p>
          <div className="follow">
            <ul>
              <li>
                <a href="https://www.facebook.com/" target="_blank">
                  <i className="fa-brands fa-square-facebook"></i>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/" target="_blank">
                  <i className="fa-brands fa-square-instagram"></i>
                </a>
              </li>
              <li>
                <a href="https://x.com/" target="_blank">
                  <i className="fa-brands fa-square-x-twitter"></i>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/" target="_blank">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="add-cont">
          <h5>Address and Contact</h5>
          <ul>
            <li>
              <i className="fa-solid fa-envelope"></i>
              <span>info@spoton.in</span>
            </li>
            <li>
              <i className="fa-solid fa-phone"></i>
              <span>+91XXXXXXXXXX</span>
            </li>
            <li>
              <i className="fa-solid fa-location-dot"></i>
              <span>ABCD Building, Bangalore</span>
            </li>
          </ul>
        </div>
        <div className="nav-link">
          <h5>Navigation Links</h5>
          <ul>
            <li>
              <Link to="../about">About Us</Link>
            </li>
            <li>
              <a href="contact.html">Contact</a>
            </li>
            <li>
              <a href="privacy.html">Privacy Policy</a>
            </li>
            <li>
              <a href="terms.html">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
