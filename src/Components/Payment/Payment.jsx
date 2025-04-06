import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Payment.css";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logowhite.png";
import emailjs from "@emailjs/browser";

const Payment = () => {
  const { bookingId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State variables for all required data
  const [bookingDetails, setBookingDetails] = useState(null);
  const [event, setEvent] = useState(null);
  const [stadium, setStadium] = useState(null);
  const [category, setCategory] = useState(null);
  const [userData, setUserData] = useState(null);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expiryTime, setExpiryTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Main fetch function to coordinate all data retrieval
    const fetchAllData = async () => {
      if (!bookingId) {
        toast.error("Invalid booking ID");
        navigate("/");
        return;
      }

      try {
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          toast.error("Booking details not found!");
          navigate("/");
          return;
        }
        const bookingData = bookingSnap.data();
        setBookingDetails(bookingData);

        // Timer logic
        const bookingTime =
          bookingData.bookingTime?.toDate?.() ||
          new Date(bookingData.bookingTime);
        const expiry = new Date(bookingTime.getTime() + 10 * 60000);
        setExpiryTime(expiry);

        let interval;
        let hasExpired = false;

        const startTimer = () => {
          interval = setInterval(() => {
            const now = new Date();
            const diff = expiry - now;

            if (diff <= 0 && !hasExpired) {
              hasExpired = true; // prevent duplicate toast + navigation
              clearInterval(interval);
              setTimeLeft("00:00");
              toast.error("Booking expired due to timeout!");
              navigate("/");
            } else if (diff > 0) {
              const minutes = String(Math.floor(diff / 60000)).padStart(2, "0");
              const seconds = String(
                Math.floor((diff % 60000) / 1000)
              ).padStart(2, "0");
              setTimeLeft(`${minutes}:${seconds}`);
            }
          }, 1000);
        };

        startTimer();

        return () => clearInterval(interval);
      } catch (error) {
        toast.error("Error fetching booking details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [bookingId, navigate]);

  useEffect(() => {
    const fetchDependentData = async () => {
      if (!bookingDetails) return;

      try {
        if (bookingDetails.eventId) {
          const eventDoc = await getDoc(
            doc(db, "events", bookingDetails.eventId)
          );
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setEvent(eventData);

            // Fetch stadium data after event data is available
            if (eventData.stadium_id) {
              const stadiumDoc = await getDoc(
                doc(db, "stadiums", eventData.stadium_id)
              );
              if (stadiumDoc.exists()) {
                setStadium(stadiumDoc.data());
              } else {
                toast.error("Stadium details not found");
              }
            }
          } else {
            toast.error("Event details not found");
          }
        }

        if (bookingDetails.categoryId) {
          const categoryDoc = await getDoc(
            doc(db, "stadium_categories", bookingDetails.categoryId)
          );
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            setCategory(categoryData);
            setTicketPrice(categoryData.base_price);
          } else {
            toast.error("Category details not found");
          }
        }

        if (currentUser && currentUser.uid) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        toast.error("Error fetching payment details");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDependentData();
  }, [bookingDetails, currentUser]);

  useEffect(() => {
    if (!bookingDetails) return;

    if (bookingDetails.payment === "Completed") {
      toast.error("Payment already completed");
      navigate("/");
    } else if (bookingDetails.payment === "Cancelled") {
      toast.error("Payment already cancelled");
      navigate("/");
    }
  }, [bookingDetails, navigate]);

  const handleCancel = async () => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { payment: "Cancelled" });
      toast.success("Booking cancelled successfully.");
      navigate("/");
    } catch (error) {
      toast.error("Error cancelling booking");
      console.error(error);
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const numSeats = bookingDetails?.seats?.length || 0;
  const subtotal = bookingDetails?.subtotal || ticketPrice * numSeats;
  const bookingFee = bookingDetails?.bookingFee || subtotal * 0.03;
  const total = bookingDetails?.totalPrice || subtotal + bookingFee;

  const sendTicketEmail = async () => {
    try {
      // Format seats data
      const seatsData = bookingDetails.seats.map((seat) => ({
        category_name: category?.category_name,
        section: seat.split("-")[0],
        row: seat.split("-")[1],
        seat_number: seat.split("-")[2],
      }));

      const templateParams = {
        to_name: userData?.username,
        email: userData?.email,
        booking_id: bookingId,
        event_name: event?.event_name,
        team1: event?.team1,
        team2: event?.team2,
        event_date: formattedEventDate,
        event_time: formattedEventTime,
        stadium_name: stadium?.stadium_name,
        stadium_location: stadium?.location,
        logo_url: { logo },
        seats: seatsData,
        subtotal: subtotal.toFixed(2),
        booking_fee: bookingFee.toFixed(2),
        total_amount: total.toFixed(2),
      };

      await emailjs.send(
        "service_vj91knm",
        "template_tj3tviy",
        templateParams,
        "UVAEUcZlQOTjm3Qdc"
      );

      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send ticket confirmation email");
    }
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }
    const options = {
      key: "rzp_test_5IYPXmnOcVJ0Ji",
      amount: total * 100,
      currency: "INR",
      name: "SpotOn",
      description: "Stadium Online Ticket Booking",
      image: logo,
      handler: async (response) => {
        try {
          // Add payment to database
          await addDoc(collection(db, "payments"), {
            bookingId: bookingId,
            paymentId: response.razorpay_payment_id,
            currency: "INR",
            status: "success",
            timestamp: serverTimestamp(),
            username: userData?.username,
            phone: userData?.phoneNumber,
            pincode: userData?.pincode,
          });

          // Update booking status
          await updateDoc(doc(db, "bookings", bookingId), {
            payment: "Completed",
          });

          // Create tickets
          const seatList = bookingDetails?.seats || [];
          const ticketPromises = seatList.map((seat) =>
            addDoc(collection(db, "tickets"), {
              seat: seat,
              bookingId: bookingId,
            })
          );
          await Promise.all(ticketPromises);

          // Send confirmation email
          await sendTicketEmail();

          toast.success(
            "Payment successful! Ticket details sent to your email."
          );
          navigate(`/tickets/${bookingId}`);
        } catch (error) {
          toast.error("Failed to complete payment process");
          console.error("Error:", error);
        }
      },
      prefill: {
        name: userData?.username,
        email: userData?.email,
        contact: userData?.phoneNumber,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const formattedEventDate = event?.date_time
    ? new Date(event.date_time).toLocaleDateString()
    : "Not available";
  const formattedEventTime = event?.date_time
    ? new Date(event.date_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  if (loading) return <div>Loading...</div>;

  if (!bookingDetails) return <div>Booking not found</div>;

  return (
    <div className="payment">
      <Navbar />
      {expiryTime && (
        <p className="expiry-time">
          Booking expires at: <strong>{expiryTime.toLocaleTimeString()}</strong>{" "}
          <br />
          Time left: <strong>{timeLeft}</strong>
        </p>
      )}
      <div className="payment-container">
        <div className="payment-summary">
          <h1>Complete Your Payment</h1>

          <div className="booking-summary">
            <h2>Booking Summary</h2>

            <div className="summary-section event-details">
              <h3>Event Details</h3>
              {event && (
                <>
                  <p>
                    <strong>Event:</strong> {event.event_name} - {event.team1}{" "}
                    vs {event.team2}
                  </p>
                  <p>
                    <strong>Date:</strong> {formattedEventDate}
                  </p>
                  <p>
                    <strong>Time:</strong> {formattedEventTime}
                  </p>
                </>
              )}
            </div>

            <div className="summary-section venue-details">
              <h3>Venue Details</h3>
              {stadium && (
                <>
                  <p>
                    <strong>Stadium:</strong>{" "}
                    {stadium.stadium_name || "Not available"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {stadium.location || "Not available"}
                  </p>
                </>
              )}
              {category && (
                <p>
                  <strong>Seating Stand:</strong>{" "}
                  {category.category_name || "Not available"}
                </p>
              )}
            </div>

            <div className="summary-section ticket-details">
              <h3>Ticket Details</h3>
              <p>
                <strong>Seats:</strong>{" "}
                {bookingDetails.seats
                  ? bookingDetails.seats.join(", ")
                  : "None selected"}
              </p>
              <p>
                <strong>Number of Tickets:</strong> {numSeats}
              </p>
              {category && (
                <p>
                  <strong>Price per Ticket:</strong> ₹{ticketPrice}
                </p>
              )}
            </div>
            <div className="summary-section billing-details">
              <h3>Billing Details</h3>
              {userData ? (
                <>
                  <p>
                    <strong>Name:</strong> {userData.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {userData.phoneNumber}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {userData.pincode}
                  </p>
                </>
              ) : (
                <p>User information not available.</p>
              )}
            </div>

            <div className="summary-section price-breakdown">
              <h3>Price Breakdown</h3>
              <div className="price-item">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="price-item">
                <span>Booking Fee (03%)</span>
                <span>₹{bookingFee.toFixed(2)}</span>
              </div>
              <div className="price-item total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-actions">
            <button className="btn secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={handlePayment}
              disabled={timeLeft === "00:00"}
            >
              Pay Now ₹{total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
