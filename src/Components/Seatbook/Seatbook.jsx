import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { db } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";
import seatData from "./EF.json";
import "./Seatbook.css";

const Seatbook = () => {
  const { eventId, categoryName } = useParams();
  const [event, setEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(0);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryDoc = await getDoc(doc(db, "categories", categoryName));
        if (categoryDoc.exists()) {
          setCategory(categoryDoc.data());
          setTicketPrice(categoryDoc.data().ticketPrice || 0);
        }
      } catch (error) {
        console.error("Error fetching category data", error);
      }
    };

    fetchCategoryData();
  }, [categoryName]);

  const toggleSeatSelection = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const getSeatStatus = (seatNumber) => {
    return category?.bookedSeats?.includes(seatNumber)
      ? "booked"
      : selectedSeats.includes(seatNumber)
      ? "selected"
      : "available";
  };

  return (
    <div className="seatbook">
      <Navbar />
      <div className="seatbook-container">
        <h2>{categoryName} - Seat Selection</h2>
        <div className="seat-layout">
          {seatData[categoryName]?.seats?.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {row.map((seatNumber) => (
                <div
                  key={seatNumber}
                  className={`seat ${getSeatStatus(seatNumber)}`}
                  onClick={() =>
                    getSeatStatus(seatNumber) === "available" &&
                    toggleSeatSelection(seatNumber)
                  }
                >
                  {seatNumber}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="seat-summary">
          <p>Selected Seats: {selectedSeats.join(", ") || "None"}</p>
          <p>Price per ticket: ₹{ticketPrice}</p>
          <p>Total Amount: ₹{selectedSeats.length * ticketPrice}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Seatbook;
