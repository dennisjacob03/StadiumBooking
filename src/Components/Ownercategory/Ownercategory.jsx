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
  updateDoc,
} from "firebase/firestore";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import "./Ownercategory.scss";

const Ownercategory = () => {
  const { currentUser } = useAuth();
  const [stadiums, setStadiums] = useState([]);
  const [stadiumCategories, setStadiumCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    stadium_id: "",
    category_name: "",
    base_price: "",
    status: 1,
  });

  useEffect(() => {
    const fetchStadiums = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "stadiums"),
          where("ownerId", "==", currentUser.uid),
          where("approval", "==", "Approved"),
          where("status", "==", 1)
        );
        const snapshot = await getDocs(q);
        setStadiums(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        toast.error("Error fetching stadiums.");
      }
    };

    const fetchStadiumCategories = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "stadium_categories"),
          where("ownerId", "==", currentUser.uid),
          where("status", "==", 1)
        );
        const snapshot = await getDocs(q);
        setStadiumCategories(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        toast.error("Error fetching stadium categories.");
      }
    };

    fetchStadiums();
    fetchStadiumCategories();
  }, [currentUser]);

const handleAddCategory = async () => {
  const { stadium_id, category_name, base_price } = newCategory;

  if (!stadium_id || !category_name || !base_price) {
    toast.error("Please fill all fields.");
    return;
  }

  // Validate price (should be a positive number only)
  if (isNaN(base_price) || Number(base_price) <= 0) {
    toast.error("Base price must be a positive number.");
    return;
  }

  // Check for duplicate category in the same stadium
  const duplicateCategory = stadiumCategories.find(
    (cat) =>
      cat.stadium_id === stadium_id &&
      cat.category_name.trim().toLowerCase() ===
        category_name.trim().toLowerCase()
  );
  if (duplicateCategory) {
    toast.error("This category already exists for the selected stadium.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "stadium_categories"), {
      ...newCategory,
      ownerId: currentUser.uid,
      createdAt: new Date(),
    });
    setStadiumCategories([
      ...stadiumCategories,
      { id: docRef.id, ...newCategory },
    ]);
    setNewCategory({
      stadium_id: "",
      category_name: "",
      base_price: "",
      status: 1,
    });
    toast.success("Category added successfully!");
  } catch (error) {
    toast.error("Error adding category.");
  }
};


  const handleDeleteCategory = async (id) => {
    try {
      await updateDoc(doc(db, "stadium_categories", id), { status: 0 });
      setStadiumCategories(stadiumCategories.filter((cat) => cat.id !== id));
      toast.success("Category deleted.");
    } catch (error) {
      toast.error("Error deleting category.");
    }
  };

  // Group categories by stadium
  const groupedCategories = stadiums.map((stadium) => ({
    ...stadium,
    categories: stadiumCategories.filter(
      (cat) => cat.stadium_id === stadium.id
    ),
  }));

  return (
    <div className="ownercategory">
      <Ownernavbar />
      <div className="category-container">
        <h2>Add Stadium Category</h2>
        <div className="add-category">
          <select
            value={newCategory.stadium_id}
            onChange={(e) =>
              setNewCategory({ ...newCategory, stadium_id: e.target.value })
            }
          >
            <option value="" disabled>
              Select Stadium
            </option>
            {stadiums.map((stadium) => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.stadium_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.category_name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, category_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Base Price"
            value={newCategory.base_price}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                // Allow only digits
                setNewCategory({ ...newCategory, base_price: value });
              }
            }}
          />

          <button onClick={handleAddCategory}>Add Category</button>
        </div>

        <div className="category-list">
          <h2>Categories by Stadium</h2>
          {groupedCategories.map((stadium) =>
            stadium.categories.length > 0 ? (
              <div key={stadium.id} className="stadium-category-table">
                <h3>Stadium: {stadium.stadium_name}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>SI No.</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stadium.categories.map((cat, index) => (
                      <tr key={cat.id}>
                        <td>{index + 1}</td>
                        <td>{cat.category_name}</td>
                        <td>₹{cat.base_price}</td>
                        <td className="actions">
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="delete-btn"
                          >
                            <i class="material-icons delete">delete</i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null
          )}
          {stadiumCategories.length === 0 && <p>No categories added yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Ownercategory;
