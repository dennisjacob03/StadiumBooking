import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Contact.css";
import { Link } from "react-router-dom";

const Contact = () => {
	const { currentUser, logout } = useAuth();
	const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
			const [loading, setLoading] = useState(false);
	
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
	const handleSubmit = async (e) => {e.preventDefault();
				setLoading(true);
				try {
					setEditMode(false);
				} catch (error) {
					toast.error("Failed to send.");
				}
				setLoading(false);
			};
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
                <input type="text" value={userData.username} disabled />
              </div>
              <div className="data">
                <label>Email:</label>
                <input type="text" value={userData.email} disabled />
              </div>
              <div className="data">
                <label>Event Name:</label>
                <input type="text" placeholder="Enter the Event name"/>
              </div>
              <div className="data">
                <label>Type of Issue:</label>
                <select className="select-bar">
                  <option value="booking">Booking Related</option>
                  <option value="event">Event Related</option>
                  <option value="payment">Payment Related</option>
                  <option value="profile">Profile Related</option>
                  <option value="technical">Technical Issue</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div className="data">
                <label>What went wrong:</label>
								<textarea name="issue" id="issue" placeholder="Help us know what went wrong"></textarea>
              </div>
            </div>
            <div className="submit">
              <button
                type="submit"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submiting..." : "SUBMIT"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Contact;
