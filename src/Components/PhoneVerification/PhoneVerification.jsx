import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "./PhoneVerification.scss";

const PhoneVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [valid, setValid] = useState(true);
  const [formattedNumber, setFormattedNumber] = useState("");
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Function to validate phone number properly
  const validatePhoneNumber = (number) => {
    if (!number) return false;

    const parsedNumber = parsePhoneNumberFromString(number);
    return parsedNumber && parsedNumber.isValid();
  };

  // Handle phone input change
  const handleChange = (value, country) => {
    const internationalNumber = `+${value}`; // Ensure it has a `+` prefix
    setPhoneNumber(value);

    const parsedNumber = parsePhoneNumberFromString(
      internationalNumber,
      country?.countryCode
    );

    if (parsedNumber && parsedNumber.isValid()) {
      setValid(true);
      setFormattedNumber(parsedNumber.formatInternational()); // Store formatted number
    } else {
      setValid(false);
      setFormattedNumber("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!valid) {
      toast.error("Invalid phone number. Please enter a valid mobile number.");
      return;
    }

    if (!user) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { phoneNumber: formattedNumber }); // Save properly formatted number

      toast.success("Phone number saved successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error saving phone number:", error);
      toast.error("Failed to save phone number. Please try again.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="cancle">
          <div className="cancle-btn" onClick={() => navigate("/profile")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="3 3 18 18"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="8" stroke="black" fill="white" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>

        <h3>Enter Phone Number</h3>
        <div className="popup-content">
          <div className="pop-input">
            <PhoneInput
              country={"in"}
              value={phoneNumber}
              onChange={(value, country) => handleChange(value, country)}
              placeholder="Enter phone number"
              inputProps={{ required: true }}
            />
          </div>
          {!valid && (
            <p className="error-message">Please enter a valid mobile number.</p>
          )}
          <div className="pop-btn">
            <button type="submit" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;
