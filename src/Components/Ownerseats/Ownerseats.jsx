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
    </div>
  );
};

export default Ownerseats;
