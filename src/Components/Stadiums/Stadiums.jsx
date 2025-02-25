import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./Stadiums.css";
import Adminnavbar from "../Adminnavbar/Adminnavbar";

const Stadiums = () => {
  const [stadiums, setStadiums] = useState([]);

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const stadiumsCollection = await getDocs(collection(db, "stadiums"));
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

  // Function to update stadium status
  const handleUpdateStatus = async (id, status) => {
    try {
      const stadiumRef = doc(db, "stadiums", id);
      const updateData = { status };

      if (status === "Disapproved") {
        updateData.disapprovedAt = serverTimestamp(); // Store disapproval timestamp
      }

      await updateDoc(stadiumRef, updateData);
      setStadiums((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updateData } : s))
      );

      toast.success(`Stadium status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update stadium status.");
    }
  };

  // Function to delete disapproved stadiums after 24 hours
  useEffect(() => {
    const deleteExpiredDisapprovedStadiums = async () => {
      try {
        const stadiumsCollection = await getDocs(collection(db, "stadiums"));
        const now = Date.now();

        stadiumsCollection.docs.forEach(async (docSnap) => {
          const stadium = docSnap.data();
          if (stadium.status === "Disapproved" && stadium.disapprovedAt) {
            const disapprovedTime = stadium.disapprovedAt.seconds * 1000; // Convert Firestore timestamp to ms
            const diffHours = (now - disapprovedTime) / (1000 * 60 * 60);

            if (diffHours >= 24) {
              await deleteDoc(doc(db, "stadiums", docSnap.id));
              setStadiums((prev) => prev.filter((s) => s.id !== docSnap.id));
              console.log(`Deleted stadium ${docSnap.id} after 24 hours`);
            }
          }
        });
      } catch (error) {
        console.error("Error deleting expired stadiums:", error);
      }
    };

    const interval = setInterval(deleteExpiredDisapprovedStadiums, 60000); // Run every 1 min
    return () => clearInterval(interval);
  }, []);

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
                <td>{stadium.status}</td>
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
