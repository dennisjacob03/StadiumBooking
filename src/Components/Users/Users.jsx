import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import Adminnavbar from "../Adminnavbar/Adminnavbar";
import "./users.css";
import userIcon from "../../assets/user-default.png";

const Users = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);

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
