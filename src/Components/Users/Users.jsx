import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import Adminnavbar from "../Adminnavbar/Adminnavbar";
import "./users.css";
import userIcon from "../../assets/user-default.png";
import { recordLoginActivity } from "../../utils/loginUtils";

const Users = () => {
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState(null);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = await getDocs(collection(db, "users"));
        const usersList = usersCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().status || "Active", // Default to Active
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          // Fetch user data
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }

          // Record login activity with admin type
          localStorage.setItem("userType", "admin");
          await recordLoginActivity(currentUser.uid, "login");
        } catch (error) {
          console.error("Error fetching admin data:", error);
          toast.error("Error loading admin data");
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success("User role updated!");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role.");
    }
  };

  // Toggle user status
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: newStatus });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      toast.success(`User status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        // Record logout activity
        await recordLoginActivity(currentUser.uid, "logout");

        // Clear userType from localStorage
        localStorage.removeItem("userType");

        // Perform logout
        await logout();
        toast.success("Logged out successfully!");
      } catch (error) {
        console.error("Error during admin logout:", error);
        toast.error("Error logging out");
      }
    }
  };

  return (
    <div className="users-container">
      <Adminnavbar />
      <div className="users">
        <h2>Users List</h2>
        <table>
          <thead>
            <tr>
              <th>SI No.</th>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={user.profile_pic || userIcon}
                    alt="User"
                    className="user-avatar"
                  />
                </td>
                <td>{user.username || "No Name"}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role || "User"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.role === "Admin"} // Disable for Admin users
                  >
                    <option value="User">User</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>{user.status}</td>
                <td className="action-btn">
                  {user.role !== "Admin" ? ( // Disable buttons for Admin users
                    user.status === "Active" ? (
                      <button
                        className="inactive-btn"
                        onClick={() => handleStatusChange(user.id, "Inactive")}
                      >
                        Inactive
                      </button>
                    ) : (
                      <button
                        className="active-btn"
                        onClick={() => handleStatusChange(user.id, "Active")}
                      >
                        Active
                      </button>
                    )
                  ) : (
                    <button className="disabled-btn" disabled>
                      Disabled
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
