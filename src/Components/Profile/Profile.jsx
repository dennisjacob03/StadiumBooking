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
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import user from "../../assets/user-default.png";
import PhoneVerification from "../PhoneVerification/PhoneVerification";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    DOB: "",
    pincode: "",
    address: "",
		city: "",
    state: "",
    profile_pic: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        navigate("/sign");
        return;
      }
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        toast.error("Failed to load User data.");
      }
    };
    fetchUserData();
  }, [currentUser, navigate]);

  const validateInput = (text) => {
    return text.trim().length > 0;
  };
  const fetchCityAndState = async (pincode) => {
    if (pincode.length !== 6) return;
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();
      if (data[0].Status === "Success") {
        const { District, State } = data[0].PostOffice[0];
        setUserData((prevData) => ({
          ...prevData,
          city: District,
          state: State,
        }));
      } else {
        toast.error("Invalid Pincode");
        setUserData((prevData) => ({ ...prevData, city: "", state: "" }));
      }
    } catch (error) {
      toast.error("Failed to fetch city and state");
    }
  };

  const handlePincodeChange = (e) => {
    const pincode = e.target.value;
    setUserData({ ...userData, pincode });
    if (pincode.length === 6) {
      fetchCityAndState(pincode);
    }
  };

  const handleEditProfile = async () => {
    setEditMode(true);
  };
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

		if(!validateInput(userData.username)) {
      toast.error("Full name cannot be empty or only spaces.");
      setLoading(false);
      return;
    }
		else if (!validateInput(userData.address)) {
			toast.error("Address cannot be empty or only spaces.");
			setLoading(false);
			return;
		}
    try {
      let profilePicData = userData.profile_pic;
      if (selectedImage?.file) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage.file);
        reader.onload = async () => {
          profilePicData = reader.result;
          await saveProfile(profilePicData);
        };
      } else {
        await saveProfile(profilePicData);
      }
    } catch (error) {
      toast.error("Failed to update profile.");
      setLoading(false);
    }
  };

  const saveProfile = async (profilePicData) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        username: userData.username || "",
        DOB: userData.DOB || "",
        city: userData.city || "",
        state: userData.state || "",
        address: userData.address || "",
        pincode: userData.pincode || "",
        profile_pic: profilePicData || "",
        updatedAt: serverTimestamp(),
      });
      toast.success("Profile updated successfully!");
      setUserData({ ...userData, profile_pic: profilePicData });
      setSelectedImage(null);
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    try {
      await sendPasswordResetEmail(currentUser.auth, userData.email);
      toast.success("Password reset email has been sent! Check your inbox.");
    } catch (error) {
      toast.error("Failed to send reset email.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file: file,
          preview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      const userRef = doc(db, "login", currentUser.uid);
      try {
        await setDoc(userRef, { logout_time: serverTimestamp() });
        await logout();
        toast.success("Logged out successfully!");
      } catch (error) {
        toast.error("Error logging out: ", error);
      }
    }
  };
	const handlePhoneVerification = () => {
    navigate("/phoneverification");
  };
  return (
    <div className="profile container">
      <Navbar />
      <div className="profile-page">
        <div className="profile-bg">
          <h1>My Profile</h1>
        </div>
        <div className="profile-details">
          <div className="section manage">
            <div className="profile-img">
              {selectedImage?.preview || userData.profile_pic ? (
                <>
                  <img
                    src={selectedImage?.preview || userData.profile_pic}
                    alt="User"
                  />
                  {editMode ? (
                    <label className="change-photo" disabled={!editMode}>
                      <span>+ New</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        hidden
                        accept="image/*"
                        disabled={!editMode}
                      />
                    </label>
                  ) : null}
                </>
              ) : (
                <>
                  {selectedImage?.preview ? (
                    <img src={selectedImage?.preview} alt="User" />
                  ) : (
                    <img src={user} alt="User" />
                  )}
                  {editMode ? (
                    <label className="default">
                      <i className="fa-solid fa-camera"></i>
                      <span>+ Add</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        hidden
                        accept="image/*"
                        disabled={!editMode}
                      />
                    </label>
                  ) : null}
                </>
              )}
            </div>
            <h3>Hi, {userData.username || "Guest"}</h3>
            <div className="manage-links">
              {!editMode ? (
                <button
                  type="button"
                  className="btn edit"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn save"
                  onClick={handleSubmitProfile}
                  disabled={
                    loading ||
                    userData.username === "" ||
                    userData.pincode === "" ||
                    userData.address === "" ||
                    userData.city === "" ||
                    userData.state === ""
                  }
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
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
              <div className="main-data email">
                <label>
                  Email:<span className="mandatory">*</span>
                </label>
                <input type="text" value={userData.email} disabled />
              </div>
              <div className="main-data">
                <label>
                  Phone:<span className="mandatory">*</span>
                </label>
                <input
                  type="text"
                  value={userData.phoneNumber || ""}
                  required
                  disabled
                />
                <button
                  type="button"
                  className="change"
                  onClick={handlePhoneVerification}
                >
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
                  Full Name: *
                </label>
                <input
                  type="text"
                  value={userData.username || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>Date Of Birth:</label>
                <input
                  type="date"
                  value={userData.DOB || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, DOB: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>
                  Pincode: *
                </label>
                <input
                  type="text"
                  value={userData.pincode || ""}
                  onChange={handlePincodeChange}
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>
                  Address: *
                </label>
                <input
                  type="text"
                  value={userData.address || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, address: e.target.value })
                  }
                  disabled={!editMode}
                />
              </div>
              <div className="data">
                <label>
                  City: *
                </label>
                <input
                  type="text"
                  value={userData.city || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, city: e.target.value })
                  }
                  disabled
									className="auto-fill"
                />
              </div>
              <div className="data">
                <label>
                  State: *
                </label>
                <input
                  type="text"
                  value={userData.state || ""}
                  onChange={(e) =>
                    setUserData({ ...userData, state: e.target.value })
                  }
                  disabled
									className="auto-fill"
                />
              </div>

              {editMode && (
                <div className="save">
                  <button
                    type="submit"
                    className="saving"
                    onClick={handleSubmitProfile}
                    disabled={
                      loading ||
                      userData.username === "" ||
                      userData.pincode === "" ||
                      userData.address === "" ||
                      userData.city === "" ||
                      userData.state === ""
                    }
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
              Add/Change Password
            </button>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Profile;
