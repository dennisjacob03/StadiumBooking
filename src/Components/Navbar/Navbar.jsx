import React, { useEffect } from "react";
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
    <nav className={`container ${sticky ? "sticky" : ""}`}>
      <img src={logo} alt="SpotOn" className="logo" />
      <ul>
        <li>Explore</li>
        <li>My Tickets</li>
        <li>Contact</li>
        <li>
          <button className="btn">SIGN IN</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
