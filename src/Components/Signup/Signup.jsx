import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db, auth, googleProvider } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailVerification, signInWithPopup } from "firebase/auth";
import logo from "../../assets/logowhite.png";
import verified from "../../assets/verified.png";
import "./Signup.css";
import google from "../../assets/google.webp";

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
  const [emailVerified, setEmailVerified] = useState(false);
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

  const handleSignup = async (e) => {
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

    try {
      setLoading(true);
      const { user } = await signup(formData.email, formData.password);

      // Send email verification
      await sendEmailVerification(user);
      toast.info("Verification email sent! Please check your inbox.");

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: formData.phone,
        createdAt: serverTimestamp(),
        emailVerified: false, // Mark as unverified initially
      });

      setLoading(false);
      navigate("/sign");
    } catch (error) {
      toast.error("Failed to create account: " + error.message);
      setLoading(false);
    }
  };

  // Google Signup with user existence check
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        toast.error("User already exists. Please sign in instead.");
        navigate("/sign"); // Redirect to sign-in page
      } else {
        await setDoc(userDocRef, {
          fullName: user.displayName || "",
          email: user.email,
          phone: user.phoneNumber || "",
          createdAt: serverTimestamp(),
          emailVerified: user.emailVerified,
        });

        toast.success("Google Signup successful!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Google Signup failed: " + error.message);
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
          <form onSubmit={handleSignup}>
            <div className="sign-opt">
              <button
                type="button"
                className="opt google-signup"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <img src={google} alt="Google" />
                Sign up with Google
              </button>
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
                <label htmlFor="email">Email</label>
                {emailVerified && <img src={verified} alt="verified" />}
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
    </div>
  );
};

export default Signup;
