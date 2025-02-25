import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import "./Ownerseats.css";

const Ownerseats = () => {
  const { currentUser } = useAuth();
  const [stadiums, setStadiums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [seats, setSeats] = useState([]);
  const [newCategory, setNewCategory] = useState({
    category_name: "",
    stadium_id: "",
    base_price: "",
  });
  const [newSeat, setNewSeat] = useState({
    category_id: "",
    row_name: "",
    seat_number: "",
  });

  useEffect(() => {
    const fetchStadiums = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "stadiums"),
          where("ownerId", "==", currentUser.uid),
          where("approved", "==", true)
        );
        const snapshot = await getDocs(q);
        setStadiums(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        toast.error("Error fetching stadiums.");
      }
    };

    const fetchCategories = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "categories"),
          where("ownerId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setCategories(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        toast.error("Error fetching categories.");
      }
    };

    const fetchSeats = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "seats"),
          where("ownerId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setSeats(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Error fetching seats.");
      }
    };

    fetchStadiums();
    fetchCategories();
    fetchSeats();
  }, [currentUser]);

  const handleAddCategory = async () => {
    if (
      !newCategory.category_name ||
      !newCategory.stadium_id ||
      !newCategory.base_price
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        ...newCategory,
        ownerId: currentUser.uid,
      });
      setCategories([...categories, { id: docRef.id, ...newCategory }]);
      setNewCategory({ category_name: "", stadium_id: "", base_price: "" });
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Error adding category.");
    }
  };

  const handleAddSeat = async () => {
    if (!newSeat.category_id || !newSeat.row_name || !newSeat.seat_number) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "seats"), {
        ...newSeat,
        ownerId: currentUser.uid,
      });
      setSeats([...seats, { id: docRef.id, ...newSeat }]);
      setNewSeat({ category_id: "", row_name: "", seat_number: "" });
      toast.success("Seat added successfully!");
    } catch (error) {
      toast.error("Error adding seat.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Category deleted.");
    } catch (error) {
      toast.error("Error deleting category.");
    }
  };

  const handleDeleteSeat = async (id) => {
    try {
      await deleteDoc(doc(db, "seats", id));
      setSeats(seats.filter((seat) => seat.id !== id));
      toast.success("Seat deleted.");
    } catch (error) {
      toast.error("Error deleting seat.");
    }
  };

  return (
    <div className="ownerseats">
      <Ownernavbar />
      <div className="seats-container">
        <h2>Manage Stadium Categories & Seats</h2>

        {/* Add Category Section */}
        <div className="add-section">
          <h3>Add Category</h3>
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.category_name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, category_name: e.target.value })
            }
          />
          <select
            value={newCategory.stadium_id}
            onChange={(e) =>
              setNewCategory({ ...newCategory, stadium_id: e.target.value })
            }
          >
            <option value="">Select Stadium</option>
            {stadiums.map((stadium) => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.stadium_name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Base Price"
            value={newCategory.base_price}
            onChange={(e) =>
              setNewCategory({ ...newCategory, base_price: e.target.value })
            }
          />
          <button onClick={handleAddCategory}>Add Category</button>
        </div>

        {/* Add Seat Section */}
        <div className="add-section">
          <h3>Add Seat</h3>
          <select
            value={newSeat.category_id}
            onChange={(e) =>
              setNewSeat({ ...newSeat, category_id: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          <select
            value={newSeat.stadium_id}
            onChange={(e) =>
              setNewSeat({ ...newSeat, stadium_id: e.target.value })
            }
          >
            <option value="">Select Stadium</option>
            {stadiums.map((stadium) => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.stadium_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Row Name"
            value={newSeat.row_name}
            onChange={(e) =>
              setNewSeat({ ...newSeat, row_name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Seat Number"
            value={newSeat.seat_number}
            onChange={(e) =>
              setNewSeat({ ...newSeat, seat_number: e.target.value })
            }
          />
          <button onClick={handleAddSeat}>Add Seat</button>
        </div>

        {/* Categories Table */}
        <h3>Categories</h3>
        <table>
          <thead>
            <tr>
              <th>SI No.</th>
              <th>Category Name</th>
              <th>Stadium Name</th>
              <th>Base Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id}>
                <td>{index + 1}</td>
                <td>{cat.category_name}</td>
                <td>
                  {stadiums.find((s) => s.id === cat.stadium_id)
                    ?.stadium_name || "N/A"}
                </td>
                <td>${cat.base_price}</td>
                <td>
                  <button onClick={() => handleDeleteCategory(cat.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Seats Table */}
        <h3>Seats</h3>
        <table>
          <thead>
            <tr>
              <th>SI No.</th>
              <th>Category Name</th>
              <th>Stadium Name</th>
              <th>Row Name</th>
              <th>Seat Number</th>
            </tr>
          </thead>
          <tbody>
            {seats.map((seat, index) => (
              <tr key={seat.id}>
                <td>{index + 1}</td>
                <td>
                  {categories.find((cat) => cat.id === seat.category_id)
                    ?.category_name || "N/A"}
                </td>
                <td>
                  {stadiums.find((s) => s.id === seat.stadium_id)
                    ?.stadium_name || "N/A"}
                </td>
                <td>{seat.row_name}</td>
                <td>{seat.seat_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ownerseats;
