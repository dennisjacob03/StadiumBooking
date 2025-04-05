import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Seatbook.css";
import { useAuth } from "../../contexts/AuthContext";

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
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        } else {
          toast.error("Event not found");
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
      // Inside loadSeatData
      try {
        const response = await fetch("/EF.json");
        const data = await response.json();
        setSeatData(data.sections);
      } catch (error) {
        console.error("Error loading seat data:", error);
        toast.error("Error loading seat data");
      }
    };

    const fetchCategoryData = async () => {
      if (!categoryId) {
        toast.error("Category ID is missing");
        return;
      }
      try {
        const categoryDoc = await getDoc(
          doc(db, "stadium_categories", categoryId)
        );
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

    const fetchBookedSeats = async () => {
      try {
        // Create arrays to track booked seats and user's own seats
        let allBookedSeats = [];
        let userActiveSeats = [];

        const bookingsQuery = query(
          collection(db, "bookings"),
          where("eventId", "==", eventId),
          where("categoryId", "==", categoryId)
        );

        const bookingSnapshots = await getDocs(bookingsQuery);

        for (const docSnap of bookingSnapshots.docs) {
          const booking = docSnap.data();
          const bookingId = docSnap.id;
          const seats = booking.seats || [];

          // Check if this booking has a successful payment
          const paymentQuery = query(
            collection(db, "payments"),
            where("bookingId", "==", bookingId),
            where("status", "==", "success") // <-- Check payment status
          );
          const paymentSnapshot = await getDocs(paymentQuery);
          const hasSuccessfulPayment = !paymentSnapshot.empty;
          if (hasSuccessfulPayment) {
            allBookedSeats.push(...seats); // Confirmed bookings = always booked
          } else if (
            currentUser &&
            booking.userId === currentUser.uid &&
            booking.payment === "Pending"
          ) {
            userActiveSeats.push(...seats); // Current user's pending booking = editable
          } else if (booking.payment === "Pending") {
            const bookingTime = booking.bookingTime?.toDate?.() || new Date(0);
            const now = new Date();
            const timeDiff = (now - bookingTime) / 1000; // in seconds

            // If booking is still within 10 minutes
            if (timeDiff < 600) {
              allBookedSeats.push(...seats);
            }
          }
        }

        setBookedSeats(allBookedSeats);
        setSelectedSeats(userActiveSeats);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
        toast.error("Error loading booked seats");
      }
    };

    fetchData();
    loadSeatData();
    fetchCategoryData();
    fetchBookedSeats();
  }, [eventId, categoryId, currentUser]);

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

  const calculateSubtotal = () => selectedSeats.length * ticketPrice;
  const calculateBookingFee = (subtotal) => subtotal * 0.03;
  const calculateTotalPrice = () => {
    const subtotal = calculateSubtotal();
    return subtotal + calculateBookingFee(subtotal);
  };

  const handleProceedToPayment = async () => {
    if (!currentUser) {
      toast.error("You need to log in before proceeding!");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const { phoneNumber, address, city, state, pincode } = userData;

        if (!phoneNumber || !address || !city || !state || !pincode) {
          toast.error(
            "Please complete your profile before proceeding to payment!"
          );
          navigate("/profile");
          return;
        }
        const subtotal = calculateSubtotal();
        const bookingFee = calculateBookingFee(subtotal);
        const totalPrice = calculateTotalPrice();
        const bookingTime = new Date();

        // Check if the user already has an active booking
        const userBookingQuery = query(
          collection(db, "bookings"),
          where("userId", "==", currentUser.uid),
          where("eventId", "==", eventId),
          where("categoryId", "==", categoryId),
          where("payment", "==", "Pending") // Only active bookings
        );

        const userBookingSnapshots = await getDocs(userBookingQuery);

        if (!userBookingSnapshots.empty) {
          // Existing booking found, update it
          const existingBookingDoc = userBookingSnapshots.docs[0];
          const existingBookingRef = doc(db, "bookings", existingBookingDoc.id);

          await updateDoc(existingBookingRef, {
            seats: selectedSeats, // Update seats
            subtotal: subtotal,
            bookingFee: bookingFee,
            totalPrice: totalPrice,
            bookingTime: bookingTime,
          });

          toast.success("Booking updated successfully!");
          navigate(`/payment/${existingBookingDoc.id}`);
        } else {
          // No active booking found, create a new one
          const bookingData = {
            userId: currentUser.uid,
            eventId: eventId,
            categoryId: categoryId,
            seats: selectedSeats,
            subtotal: subtotal,
            bookingFee: bookingFee,
            totalPrice: totalPrice,
            bookingTime: bookingTime,
            payment: "Pending",
          };

          const bookingRef = await addDoc(
            collection(db, "bookings"),
            bookingData
          );

          // Auto-expire the booking after 10 minutes
          setTimeout(async () => {
            try {
              const bookingSnapshot = await getDoc(bookingRef);
              const bookingData = bookingSnapshot.data();

              const paymentQuery = query(
                collection(db, "payments"),
                where("bookingId", "==", bookingRef.id)
              );
              const paymentSnapshot = await getDocs(paymentQuery);

              if (
                bookingSnapshot.exists() &&
                bookingData.payment === "Pending" &&
                paymentSnapshot.empty
              ) {
                await updateDoc(bookingRef, { payment: "Cancelled" });

                // Instead of toast+navigate inside timeout
                console.warn("Booking expired. Seats released.");
              }
            } catch (error) {
              console.error("Error in timeout cancellation:", error);
            }
          }, 600000); // 10 minutes

          toast.success("Booking successful! Proceed to payment.");
          navigate(`/payment/${bookingRef.id}`);
        }
      } else {
        toast.error("User profile not found! Please update your profile.");
        navigate("/profile");
      }
    } catch (error) {
      toast.error("Error processing booking!");
      console.error("Error:", error);
    }
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
          <div className="all-seats">
            {seatData && seatData.length > 0 ? (
              <div className="seat-sections">
                {seatData.map((section) => (
                  <div key={section.section_id} className="seat-section">
                    <h3 className="seat_id">Section {section.section_id}</h3>
                    <div className="row">{renderSectionRows(section)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="loading">Loading seats...</p>
            )}
          </div>
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
              ₹{calculateSubtotal()} <span>{selectedSeats.length} Tickets</span>
            </p>
          </span>
          <button
            disabled={selectedSeats.length === 0}
            onClick={handleProceedToPayment}
          >
            BOOK
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Seatbook;
