import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db, auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import logo from "../../assets/logowhite.png";
import google from "../../assets/google.webp";
import "./Sign.scss";

const Sign = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Handle Email & Password Sign-In
  async function handleSubmit(e) {
    e.preventDefault();
  setError("");
  setLoading(true);

    try {
      const { user } = await login(email, password);

      if (!user.emailVerified) {
        setLoading(false);
        setError("Please verify your email before logging in.");
        toast.error("Email not verified! Please check your inbox.");
        return;
      }

      // Fetch user status from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setLoading(false);
        setError("No account found. Please sign up.");
        return;
      }
			let role = "User";
      let status = "Active";
			if (userDoc.exists()) {
        // If new user, create document
        const userData = userDoc.data();
        role = userData.role || "User";
        status = userData.status || "Active";
        if (status === "Active") toast.success("Login successful!");
			if ((role === "Admin") & (status === "Active")) navigate("/admindash");
      else if ((role === "Owner") & (status === "Active"))
        navigate("/ownerdash");
      else if ((role === "User") & (status === "Active")) navigate("/");
      else toast.error("You have been blocked by the Admin");
      }
      const userData = userDoc.data();
      if (userData.status !== "Active") {
        setLoading(false);
        setError("Your account has been blocked by the admin.");
        toast.error("Access denied! Your account is inactive.");
        return;
      }

    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        default:
          setError("Failed to sign in");
      }
    }
    setLoading(false);
  }

  // Handle Password Reset
  async function handleForgotPassword() {
    if (!email) {
      return toast.error("Please enter your email to reset the password.");
    }

    try {
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to send reset email.");
    }
  }

  // Handle Google Sign-In
  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let role = "User";
			let status = "Active";

      if (!userDoc.exists()) {
        // If new user, create document
        await setDoc(userDocRef, {
          username: user.displayName || "",
          email: user.email,
          createdAt: serverTimestamp(),
          role: "User",
					status: "Active",
        });

        toast.success("Google Sign Up successful!");
        toast.info("You didn't have an account. One has been created.");
      } else {
        // If existing user, retrieve role from Firestore
        const userData = userDoc.data();
        role = userData.role || "user";
				status = userData.status || "Active";
				if(status === "Active") toast.success("Google Sign In successful!");
      }

      // Redirect based on role
      if ((role === "Admin") & (status === "Active")) navigate("/admindash");
      else if ((role === "Owner") & (status === "Active")) navigate("/ownerdash");
      else if ((role === "User") & (status === "Active")) navigate("/");
			else toast.error("You have been blocked by the Admin")
    } catch (error) {
      toast.error("Google Sign In failed: " + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="sign">
      <div className="sign-page">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="SpotOn" />
          </Link>
        </div>
        <div className="container">
          <div className="head">Sign In</div>
          <form onSubmit={handleSubmit}>
            <div className="sign-opt">
              <button
                type="button"
                className="opt google-signin"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src={google} alt="Google" />
                Sign In with Google
              </button>
            </div>
            <div className="separator">
              <hr />
              <p>or</p>
              <hr />
            </div>
            <div className="form-all">
              <div className="form">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="forgot">
                <button type="button" onClick={handleForgotPassword}>
                  Forgot Password?
                </button>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="signing">
              <button type="submit" className="signbtn" disabled={loading}>
                {loading ? "Signing In..." : "SIGN IN"}
              </button>
              <div className="checking">
                Don't have an account?
                <Link to="/signup"> Sign Up</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
			
    </div>
  );
};

export default Sign;
