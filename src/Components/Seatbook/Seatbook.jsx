import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import "./Seatbook.css";

const Seatbook = () => {
  return (
		<div className="seatbook">
			<Navbar/>
			<div className="seatbook-container"></div>
			<Footer/>
		</div>
	)
};

export default Seatbook;
