import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logowhite.png";

const Navbar = () => {

	const [sticky, setSticky] = React.useState(false);
	React.useEffect(() => {
		window.addEventListener("scroll", () => {
			window.scrollY > 50 ? setSticky(true) : setSticky(false);
		});
	},[]);


  return (
    <div className="navbar">
      <nav className={`container ${sticky ? "dark-nav" : ""}`}>
        <img src={logo} alt="SpotOn" className="logo" />
        <ul>
          <li>Explore</li>
          <li>My Tickets</li>
          <li>Contact</li>
          <li>
            <Link to="/Sign">
              <button className="btn">SIGN IN</button>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
