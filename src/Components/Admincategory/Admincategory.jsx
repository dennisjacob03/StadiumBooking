import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./Admincategory.css";
import Adminnavbar from "../Adminnavbar/Adminnavbar";

const Admincategory = () => {
	const [stadiums, setStadiums] = useState([]);
	const [stadiumCategories, setStadiumCategories] = useState([]);

	useEffect(() => {
		const fetchStadiums = async () => {
			try {
				const q = query(
					collection(db, "stadiums"),
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
			try {
				const q = query(
					collection(db, "stadium_categories"),
					where("status", "==", 1)
				);
				const snapshot = await getDocs(q);
				setStadiumCategories(
					snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
				);
			} catch (error) {
				toast.error("Error fetching categories.");
			}
		};

		fetchStadiums();
		fetchStadiumCategories();
	}, []);

	// Group categories by stadium
	const groupedCategories = stadiums.map((stadium) => ({
		...stadium,
		categories: stadiumCategories.filter(
			(cat) => cat.stadium_id === stadium.id
		),
	}));

	return (
    <div className="admincategory">
      <Adminnavbar />
      <div className="category-container">
        <div className="category-list">
          <h2>Stadium Categories (Admin View)</h2>
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
                    </tr>
                  </thead>
                  <tbody>
                    {stadium.categories.map((cat, index) => (
                      <tr key={cat.id}>
                        <td>{index + 1}</td>
                        <td>{cat.category_name}</td>
                        <td>₹{cat.base_price}</td>
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

export default Admincategory;
