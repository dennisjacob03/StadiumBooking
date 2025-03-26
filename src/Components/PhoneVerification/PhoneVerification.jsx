import React, {useRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import "./PhoneVerification.css";
import { useNavigate } from "react-router-dom";

const PhoneVerification = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState(null);
	const recaptchaVerifierRef=useRef(null);

  const navigate = useNavigate();

  useEffect(() => {

		console.log("auth object: ", auth);
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => 
            console.log("reCAPTCHA solved"),
          "expired-callback": () =>
            toast.info("reCAPTCHA expired, please try again."),
          }
      );
      recaptchaVerifierRef.current.render();
    }
  }, []);

  const sendOtp = async () => {
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    try {
      const fullPhoneNumber = `+91${phone}`; // Add country code if needed
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifierRef.current
      );
      toast.success("OTP sent successfully!");
      setUser(confirmation);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP: " + err.message);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Enter OTP first");
      return;
    }
    try {
      await user.confirm(otp);
      toast.success("Phone number verified successfully!");
      navigate("/profile"); // navigate after verification
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify OTP: " + err.message);
    }
  };

  const handlePhoneVerification = () => {
    navigate("/profile");
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="cancle">
          <div className="cancle-btn" onClick={handlePhoneVerification}>
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
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="pop-btn">
            <button onClick={sendOtp}>Send OTP</button>
          </div>
          <div id="recaptcha-container"></div>
          <div className="pop-input">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
          </div>
          <div className="pop-btn">
            <button onClick={verifyOtp}>Verify OTP</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;
