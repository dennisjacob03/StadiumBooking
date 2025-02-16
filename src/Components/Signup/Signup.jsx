import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import logo from "../../assets/logowhite.png";
import verified from "../../assets/verified.png";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateFullName = (name) => {
    const trimmedName = name.trim();
    const nameRegex = /^[A-Za-z ]+$/;
    return trimmedName.length > 0 && nameRegex.test(trimmedName);
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  };

  const sendOtpToEmail = async () => {
    if (!formData.email) return toast.error("Please enter an email address.");

    const otpCode = generateOTP();
    setGeneratedOtp(otpCode);
    setOtpSent(true);

    // Store OTP in Firestore (temporary)
    await setDoc(doc(db, "otp_verifications", formData.email), {
      otp: otpCode,
      createdAt: serverTimestamp(),
    });

    toast.info(`OTP sent to ${formData.email}. Check your inbox.`);
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error("Please enter the OTP.");
    const otpDoc = await getDoc(doc(db, "otp_verifications", formData.email));

    if (otpDoc.exists() && otpDoc.data().otp === otp) {
      toast.success("OTP Verified! You can now create an account.");
      setOtpVerified(true);
    } else {
      toast.error("Invalid OTP! Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFullName(formData.fullName)) {
      return toast.error("Invalid full name! Only letters and spaces allowed.");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match!");
    }

    if (!formData.agreeToTerms) {
      return toast.error("Please agree to the Terms of Service.");
    }

    if (!otpVerified) {
      return toast.error("Please verify your email first.");
    }

    try {
      setLoading(true);
      const { user } = await signup(formData.email, formData.password);

      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: formData.phone,
        createdAt: serverTimestamp(),
      });

      toast.success("Account created successfully!");
      navigate("/home");
    } catch (error) {
      toast.error("Failed to create account: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="signup">
      <div className="signup-page">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="SpotOn" />
          </Link>
        </div>
        <div className="container">
          <div className="head">Sign Up</div>
          <form onSubmit={handleSubmit}>
            <div className="sign-opt">
              <a href="google.com">
                <div className="opt">
                  <img src="/image/google.webp" alt="" />
                  Google
                </div>
              </a>
            </div>
            <div className="separator">
              <hr />
              <p>or</p>
              <hr />
            </div>
            <div className="form-all">
              <div className="form">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form">
                <div className="label-verify">
                  <label htmlFor="email">Email</label>
                  <span className="verify">
                    <button type="button" onClick={sendOtpToEmail}>
                      <span>{otpSent ? "OTP Sent" : "Verify"}</span>
                      {otpVerified && <img src={verified} alt="verified" />}
                    </button>
                  </span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="check">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  id="check"
                />
                <label htmlFor="check">
                  By creating an account you agree with our
                  <Link to="/terms"> Terms of Service </Link> and
                  <Link to="/privacy"> Privacy Policy</Link>
                </label>
              </div>
            </div>
            <div className="signing">
              <button type="submit" className="signbtn" disabled={loading}>
                {loading ? "Creating Account..." : "SIGN UP"}
              </button>
              <div className="checking">
                Already have an account?
                <Link to="/sign"> Sign In</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      {otpSent && (
        <div className="popup">
          <div className="pop-box">
            <div className="pop-head">Verification</div>
            <div className="pop-content">
              <div className="pop-text">Enter the OTP sent to your email.</div>
              <div className="pop-input">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="pop-btn">
                  <button className="verify-btn" onClick={verifyOtp}>
                Verify OTP
              </button>
							<button className="resend-btn"onClick={sendOtpToEmail}>Resend OTP</button></div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
