import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Contact.css";
import { Link } from "react-router-dom";

const Contact = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    eventName: "",
    issueType: "booking",
    description: "",
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

  const sendContactEmail = async (contactId) => {
    try {
      const currentTime = new Date().toLocaleString();

      const templateParams = {
        name: userData.username,
        email: userData.email,
        time: currentTime,
        message: formData.description,
        issue_type: formData.issueType,
        event_name: formData.eventName,
        contact_id: contactId,
      };

      await emailjs.send(
        "service_vj91knm",
        "template_vvuow1a",
        templateParams,
        "UVAEUcZlQOTjm3Qdc"
      );

      console.log("Contact form email sent successfully");
    } catch (error) {
      console.error("Error sending contact form email:", error);
      toast.error("Failed to send contact form email");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.eventName.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const contactsRef = collection(db, "contacts");
      const docRef = await addDoc(contactsRef, {
        userId: currentUser.uid,
        username: userData.username,
        email: userData.email,
        eventName: formData.eventName,
        issueType: formData.issueType,
        description: formData.description,
        status: "pending", // Can be: pending, in-progress, resolved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send email notification
      await sendContactEmail(docRef.id);

      toast.success("Your issue has been submitted successfully!");
      // Reset form
      setFormData({
        eventName: "",
        issueType: "booking",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to submit your issue. Please try again.");
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
          <form onSubmit={handleSubmit}>
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
                <label>
                  Event Name:<span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Enter the Event name"
                  required
                />
              </div>
              <div className="data">
                <label>
                  Type of Issue:<span className="mandatory">*</span>
                </label>
                <select
                  className="select-bar"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleInputChange}
                >
                  <option value="booking">Booking Related</option>
                  <option value="event">Event Related</option>
                  <option value="payment">Payment Related</option>
                  <option value="profile">Profile Related</option>
                  <option value="technical">Technical Issue</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div className="data">
                <label>
                  What went wrong:<span className="mandatory">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Help us know what went wrong"
                  required
                ></textarea>
              </div>
            </div>
            <div className="submit">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "SUBMIT"}
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
