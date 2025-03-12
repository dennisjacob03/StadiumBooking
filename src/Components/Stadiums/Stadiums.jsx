import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import "./Stadiums.css";
import Adminnavbar from "../Adminnavbar/Adminnavbar";

const Stadiums = () => {
  const [stadiums, setStadiums] = useState([]);

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const stadiumsQuery = query(
          collection(db, "stadiums"),
          where("status", "==", 1) // Fetch only active stadiums
        );
        const stadiumsCollection = await getDocs(stadiumsQuery);
        const stadiumList = stadiumsCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStadiums(stadiumList);
      } catch (error) {
        console.error("Error fetching stadiums:", error);
      }
    };

    fetchStadiums();
  }, []);

  // Function to update stadium approval status
  const handleUpdateStatus = async (id, approval) => {
    try {
      const stadiumRef = doc(db, "stadiums", id);
      const updateData = { approval };

      if (approval === "Disapproved") {
        updateData.disapprovedAt = serverTimestamp();
      }

      await updateDoc(stadiumRef, updateData);
      setStadiums((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updateData } : s))
      );

      toast.success(`Stadium status updated to ${approval}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update stadium status.");
    }
  };

  return (
    <div className="stadiums">
      <Adminnavbar />
      <div className="stadiums-container">
        <h2>Stadium Requests</h2>
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
                <td>{stadium.stadium_name}</td>
                <td>{stadium.location}</td>
                <td>{stadium.capacity}</td>
                <td>{stadium.approval}</td>
                <td>
                  <button
                    onClick={() => handleUpdateStatus(stadium.id, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(stadium.id, "Disapproved")
                    }
                  >
                    Disapprove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stadiums;
