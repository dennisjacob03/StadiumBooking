import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Seatbook.css";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="tools">
      <button onClick={() => zoomIn()}>+</button>
      <button onClick={() => zoomOut()}>-</button>
      <button onClick={() => resetTransform()}>x</button>
    </div>
  );
};
const Seatbook = () => {
  const { eventId, categoryId } = useParams();
  const [event, setEvent] = useState(null);
  const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [seatData, setSeatData] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        } else {
          toast.error("Event not found");
          setLoading(false);
          return;
        }

        const stadiumsRef = collection(db, "stadiums");
        const snapshot = await getDocs(stadiumsRef);
        const stadiumData = {};
        snapshot.docs.forEach((doc) => {
          stadiumData[doc.id] = {
            name: doc.data().stadium_name,
            location: doc.data().location || "Unknown location",
          };
        });
        setStadiums(stadiumData);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching event/stadium data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    const loadSeatData = async () => {
      try {
        const response = await fetch("/EF.json");
        const data = await response.json();
        setSeatData(data.sections);
      } catch (error) {
        toast.error("Error loading seat data:", error);
      }
    };

    const fetchCategoryData = async () => {
			if (!categoryId) {
        toast.error("Category ID is missing");
        return;
      }
      try {
        const categoryDoc = await getDoc(doc(db, "stadium_categories", categoryId));
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          setCategory(categoryData.category_name);
          setTicketPrice(categoryData.base_price);
        } else {
          toast.error("Category not found");
        }
      } catch (error) {
        toast.error("Error fetching category data");
    console.error("Firestore Error:", error);
      }
    };

    fetchData();
    loadSeatData();
    fetchCategoryData();
  }, [eventId, categoryId]);

  const toggleSeatSelection = (sectionId, row, seatNumber) => {
    const seatId = `${sectionId}-${row}-${seatNumber}`;
    if (bookedSeats.includes(seatId)) return;
    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((seat) => seat !== seatId)
        : [...prevSeats, seatId]
    );
  };

  const getSeatStatus = (sectionId, row, seatNumber) => {
    const seatId = `${sectionId}-${row}-${seatNumber}`;
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const renderRowSeats = (section, row) => {
    return Array.from({ length: row.seats }, (_, index) => {
      const seatNumber = index + 1;
      const seatStatus = getSeatStatus(section.section_id, row.row, seatNumber);
      return (
        <div
          key={`${section.section_id}-${row.row}-${seatNumber}`}
          className={`seat ${seatStatus}`}
          onClick={() =>
            seatStatus !== "booked" &&
            toggleSeatSelection(section.section_id, row.row, seatNumber)
          }
        >
          {seatNumber}
        </div>
      );
    });
  };

  const renderSectionRows = (section) => {
    return section.rows.map((row) => (
      <div key={`${section.section_id}-${row.row}`} className="seat-row">
        <div className="row-label">{row.row}</div>
        <div className="seat-layout">{renderRowSeats(section, row)}</div>
      </div>
    ));
  };

  const calculateTotalPrice = () => {
    return selectedSeats.length * ticketPrice;
  };

  const handleProceedToPayment = () => {
    console.log("Proceeding to payment", selectedSeats);
  };

  return (
    <div className="seatbook">
      <Navbar />
      <div className="seatbook-container">
        <div className="mainhead">
          {event ? (
            <>
              <h2 className="stadium-title">
                {event.event_name} -{" "}
                {new Date(event.date_time).toLocaleString()} - {event.team1} vs{" "}
                {event.team2}
              </h2>
              <p>
                {stadiums[event.stadium_id]?.name},{" "}
                {stadiums[event.stadium_id]?.location}
              </p>
            </>
          ) : (
            <p>Loading event details...</p>
          )}
        </div>

        <div className="zooming">
          {/* <TransformWrapper
            initialScale={1}
            initialPositionX={200}
            initialPositionY={100}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <Controls />
                <TransformComponent> */}
                  <div className="all-seats">
                    {seatData && seatData.length > 0 ? (
                      <div className="seat-sections">
                        {seatData.map((section) => (
                          <div
                            key={section.section_id}
                            className="seat-section"
                          >
                            <h3 className="seat_id">
                              Section {section.section_id}
                            </h3>
                            <div className="row">
                              {renderSectionRows(section)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="loading">Loading seats...</p>
                    )}
                  </div>
                {/* </TransformComponent>
              </>
            )}
          </TransformWrapper> */}
        </div>
      </div>
      <div className="seat-summary">
        <h4 className="category_name">{category}</h4>
        <div className="proceeding">
          <p>
            Selected Seats:{" "}
            <span className="selected">{selectedSeats.join(", ")}</span>
          </p>
          <span className="totaling">
            <p>
              {selectedSeats.length} x {ticketPrice}
            </p>
            <span className="line"></span>
            <p className="numbers">
              ₹{calculateTotalPrice()}{" "}
              <span>{selectedSeats.length} Tickets</span>
            </p>
          </span>
          <button
            disabled={selectedSeats.length === 0}
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Seatbook;
