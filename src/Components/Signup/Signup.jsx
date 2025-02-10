import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { sendEmailVerification } from "firebase/auth";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
    const trimmedName = name.trim(); // Remove leading and trailing spaces
    const nameRegex = /^[A-Za-z ]+$/; // Only letters and spaces allowed
    return trimmedName.length > 0 && nameRegex.test(trimmedName);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateFullName(formData.fullName)) {
      return toast.error(
        "Invalid full name! Only letters and spaces are allowed."
      );
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match!");
    }

    if (!validatePhoneNumber(formData.phone)) {
      return toast.error("Invalid phone number! Enter a 10-digit number.");
    }

    if (!formData.agreeToTerms) {
      return toast.error(
        "Please agree to the Terms of Service and Privacy Policy"
      );
    }

    try {
      setLoading(true);
      const { user } = await signup(formData.email, formData.password);

      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName.trim(), // Save cleaned full name
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);
      toast.info(
        "A verification email has been sent. Please check your inbox."
      );

      navigate("/sign");
    } catch (error) {
      toast.error("Failed to create account: " + error.message);
    }
    setLoading(false);
  }

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
            <div className="form-all">
              <div className="form main">
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
                    <button type="button">
                      <span>Verified</span>
                      <img src={verified} alt="verified" />
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
                <div className="label-verify">
                  <label htmlFor="phone">Phone Number</label>
                  <span className="verify">
                    <button type="button">
                      <span>Verified</span>
                      <img src={verified} alt="verified" />
                    </button>
                  </span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
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
    </div>
  );
};

export default Signup;
