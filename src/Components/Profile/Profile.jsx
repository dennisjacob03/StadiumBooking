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
import "./Profile.css";
import { Link } from "react-router-dom";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    DOB: "",
    state: "",
    address: "",
    pincode: "",
    profile_pic: "",
  });

	const [editMode, setEditMode] = useState(false);
		const [loading, setLoading] = useState(false);
		const [selectedFile, setSelectedFile] = useState(null);
	
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

  const handleEditProfile = async () => {
		setEditMode(true);
	};
	const handleSubmitProfile = async (e) => {e.preventDefault();
			setLoading(true);
	
			try {
				const userRef = doc(db, "users", currentUser.uid);
				await updateDoc(userRef, {
					username: userData.username,
					DOB: userData.DOB,
					state: userData.state,
					address: userData.address,
					pincode: userData.pincode,
				});
	
				toast.success("Profile updated successfully!");
				setEditMode(false);
			} catch (error) {
				toast.error("Failed to update profile.");
			}
			setLoading(false);
		};
	const handleChangePassword = async () => {
			try {
				await resetPassword(userData.email);
				toast.success("Password reset email has been sent! Check your inbox.");
			} catch (error) {
				toast.error("Failed to send reset email.");
			}
		};
		
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      const userRef = doc(db, "login", currentUser.uid);

      try {
        // Store logout time in Firestore
        await setDoc(userRef, {
          logout_time: serverTimestamp(),
        });

        await logout();
        toast.success("Logged out successfully!");
      } catch (error) {
        toast.error("Error logging out: ", error);
      }
    }
  };
  return (
    <div className="profile container">
      <Navbar></Navbar>
      <div className="profile-page">
        <div className="profile-bg">
          <h1>My Profile</h1>
        </div>
        <div className="profile-details">
          <div className="section manage">
            <div className="profile-img">
              {userData?.profile_pic ? (
                <img src={userData?.profile_pic} alt="User" />
              ) : (
                <label className="default">
                  <i className="fa-solid fa-camera"></i>
                  <span>+ Add</span>
                  <input type="file" onChange={handleFileChange} hidden />
                </label>
              )}
            </div>
            <h3>Hi, {userData.username || "Guest"}</h3>
            <div className="manage-links">
              {!editMode ? (
                <button
                  type="button"
                  className="btn"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn"
                  onClick={handleSubmitProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
              <Link to="/">
                <button type="button" className="btn" onClick={handleLogout}>
                  Log Out
                </button>
              </Link>
            </div>
          </div>
          <hr />
          <div className="section account-data">
            <div className="main">
              <span className="subhead">
                <h3>
                  Account Details:<span className="mandatory">*</span>
                </h3>
              </span>
              <div className="main-data">
                <label>
                  Email:<span className="mandatory">*</span>
                </label>
                <input type="text" value={userData.email} disabled />
                <button type="button" className="change">
                  {userData?.email?.length > 0 ? "Change" : "Add"}
                </button>
              </div>
              <div className="main-data">
                <label>
                  Phone:<span className="mandatory">*</span>
                </label>
                <input type="text" value={userData.phone} required disabled />
                <button type="button" className="change">
                  {userData?.phone?.length > 0 ? "Change" : "Add"}
                </button>
              </div>
            </div>
            <hr />
            <form className="section account-data">
              <span className="subhead">
                <h3>Additional Details:</h3>
              </span>
              <div className="data">
                <label>
                  Full Name:
                  <span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  value={userData.username}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>Date Of Birth:</label>
                <input
                  type="text"
                  value={userData.DOB}
                  onChange={(e) =>
                    setUserData({ ...userData, DOB: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>State:</label>
                <input
                  type="text"
                  value={userData.state}
                  onChange={(e) =>
                    setUserData({ ...userData, state: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>Address:</label>
                <input
                  type="text"
                  value={userData.address}
                  onChange={(e) =>
                    setUserData({ ...userData, address: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>Pincode:</label>
                <input
                  type="text"
                  value={userData.pincode}
                  onChange={(e) =>
                    setUserData({ ...userData, pincode: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              {editMode && (
                <div className="save">
                  <button
                    type="submit"
                    className="saving"
                    onClick={handleSubmitProfile}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "SAVE CHANGES"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="otheredits">
          <div className="edit">
            <button type="button" onClick={handleChangePassword}>
              {userData?.password?.length > 0
                ? "Change Password"
                : "Add Password"}
            </button>
          </div>
          <div className="edit">
            <button>Delete Acoount</button>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Profile;
