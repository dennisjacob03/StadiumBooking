import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import logo from "../../assets/logowhite.png";
import "./Sign.css";

const Sign = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const { user } = await login(email, password);

      if (!user.emailVerified) {
        setLoading(false);
        setError("Please verify your email before logging in.");
        toast.error("Email not verified! Please check your inbox.");
        return;
      }

      toast.success("Login successful!");
      navigate("/");
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
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
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
