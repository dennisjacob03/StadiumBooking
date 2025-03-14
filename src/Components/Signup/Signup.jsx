import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db, auth, googleProvider } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailVerification, signInWithPopup } from "firebase/auth";
import logo from "../../assets/logowhite.png";
import "./Signup.css";
import google from "../../assets/google.webp";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
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
    const trimmedName = name.trim();
    const nameRegex = /^[A-Za-z ]+$/;
    return trimmedName.length > 0 && nameRegex.test(trimmedName);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateFullName(formData.username)) {
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

      await sendEmailVerification(user);
      toast.info("Verification email sent! Please check your inbox.");

      await setDoc(doc(db, "users", user.uid), {
        username: formData.username.trim(),
        email: formData.email,
        createdAt: serverTimestamp(),
        role: "User",
        status: "Active",
      });

      setLoading(false);
      navigate("/sign");
    } catch (error) {
      toast.error("Failed to create account: " + error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);

      if (auth.currentUser) {
        await auth.signOut();
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let role = "User";
      let status = "Active";

      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role || "User";
        status = userData.status || "Active";
        if(status === "Active") toast.success("Google Sign In successful!");
      } else {
        await setDoc(userDocRef, {
          username: user.displayName || "",
          email: user.email,
          createdAt: serverTimestamp(),
          role: "User",
          status: "Active",
        });
        toast.success("Google Sign Up successful!");
      }

      if (status !== "Active") {
        toast.error("You have been blocked by the Admin");
      } else if (role === "Admin") {
        navigate("/admindash");
      } else if (role === "Owner") {
        navigate("/ownerdash");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("Google Sign Up failed: " + error.message);
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
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
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
