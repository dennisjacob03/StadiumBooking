import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import "./Ownerstadiums.css";

const Ownerstadiums = () => {
  const { currentUser } = useAuth();
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({});
  const [newStadium, setNewStadium] = useState({
    stadium_name: "",
    location: "",
    capacity: "",
    layout: "",
    status: "Pending",
  });

  // 🔹 Optimized Firestore query to fetch only the stadiums of the logged-in owner
  useEffect(() => {
    const fetchStadiums = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const stadiumsRef = collection(db, "stadiums");
        const q = query(stadiumsRef, where("ownerId", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        const stadiumList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStadiums(stadiumList);
      } catch (error) {
        console.error("Error fetching stadiums:", error);
        toast.error("Failed to load stadiums.");
      }
      setLoading(false);
    };

    fetchStadiums();
  }, [currentUser]);

  const handleEditClick = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveClick = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "stadiums", id), updatedData);
      setEditMode((prev) => ({ ...prev, [id]: false }));
      toast.success("Stadium updated successfully!");
    } catch (error) {
      console.error("Error updating stadium:", error);
      toast.error("Failed to update stadium.");
    }
  };

  const handleDeleteStadium = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stadium?"))
      return;
    try {
      await deleteDoc(doc(db, "stadiums", id));
      setStadiums(stadiums.filter((stadium) => stadium.id !== id));
      toast.success("Stadium deleted!");
    } catch (error) {
      console.error("Error deleting stadium:", error);
      toast.error("Failed to delete stadium.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStadium((prev) => ({ ...prev, layout: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStadium = async () => {
    if (
      !newStadium.stadium_name ||
      !newStadium.location ||
      !newStadium.capacity ||
      !newStadium.layout
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "stadiums"), {
        ...newStadium,
        ownerId: currentUser.uid,
        createdAt: new Date(),
      });
      setStadiums([...stadiums, { id: docRef.id, ...newStadium }]);
      setNewStadium({
        stadium_name: "",
        location: "",
        capacity: "",
        layout: "",
        status: "Pending",
      });
      toast.success("Stadium added successfully!");
    } catch (error) {
      console.error("Error adding stadium:", error);
      toast.error("Failed to add stadium.");
    }
  };

  return (
    <div className="ownerstadiums">
      <Ownernavbar />
      <div className="stadiums-container">
        <h2>Manage Your Stadiums</h2>

        <div className="add-stadium">
          <input
            type="text"
            placeholder="Stadium Name"
            value={newStadium.stadium_name}
            onChange={(e) =>
              setNewStadium({ ...newStadium, stadium_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Location"
            value={newStadium.location}
            onChange={(e) =>
              setNewStadium({ ...newStadium, location: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Capacity"
            value={newStadium.capacity}
            onChange={(e) =>
              setNewStadium({ ...newStadium, capacity: e.target.value })
            }
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button className="add-btn" onClick={handleAddStadium}>
            Add Stadium
          </button>
        </div>

        {loading ? (
          <p>Loading stadiums...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SI No.</th>
                <th>Layout</th>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stadiums.map((stadium, index) => (
                <tr key={stadium.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={stadium.layout || "https://via.placeholder.com/50"}
                      alt="Stadium Layout"
                      className="stadium-img"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={stadium.stadium_name}
                      disabled={!editMode[stadium.id]}
                      onChange={(e) =>
                        setStadiums(
                          stadiums.map((s) =>
                            s.id === stadium.id
                              ? { ...s, stadium_name: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={stadium.location}
                      disabled={!editMode[stadium.id]}
                      onChange={(e) =>
                        setStadiums(
                          stadiums.map((s) =>
                            s.id === stadium.id
                              ? { ...s, location: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={stadium.capacity}
                      disabled={!editMode[stadium.id]}
                      onChange={(e) =>
                        setStadiums(
                          stadiums.map((s) =>
                            s.id === stadium.id
                              ? { ...s, capacity: e.target.value }
                              : s
                          )
                        )
                      }
                    />
                  </td>
                  <td className="status">
                    <span
                      className={
                        stadium.status === "Approved" ? "approved" : "pending"
                      }
                    >
                      {stadium.status}
                    </span>
                  </td>
                  <td className="actions">
                    {editMode[stadium.id] ? (
                      <button
                        className="save"
                        onClick={() => handleSaveClick(stadium.id, stadium)}
                      >
                        <i class="material-icons save">save</i>
                      </button>
                    ) : (
                      <button
                        className="edit"
                        onClick={() => handleEditClick(stadium.id)}
                      >
                        <i class="material-icons edit">edit</i>
                      </button>
                    )}
                    <button
                      className="delete"
                      onClick={() => handleDeleteStadium(stadium.id)}
                    >
                      <i class="material-icons delete">delete</i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Ownerstadiums;
