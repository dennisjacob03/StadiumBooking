import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Tickets.css";
import { useAuth } from "../../contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Tickets = () => {
  const { bookingId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [stadium, setStadium] = useState(null);
  const [category, setCategory] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ticketRefs = useRef([]);

  const handleDownloadPDF = async (index) => {
    try {
      const ticketElement = ticketRefs.current[index];
      if (!ticketElement) return;

      const scale = 2;
      const canvas = await html2canvas(ticketElement, {
        scale: scale,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`SpotOn-Ticket-${tickets[index].id}.pdf`);

      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Error downloading ticket:", error);
      toast.error("Failed to download ticket. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch booking
        const bookingRef = doc(collection(db, "bookings"), bookingId);
        const bookingDoc = await getDoc(bookingRef);

        if (!bookingDoc.exists()) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
        if (bookingData.userId !== currentUser.uid) {
          setError("Unauthorized access");
          navigate("/");
          setLoading(false);
          return;
        }
        setBooking(bookingData);

        // Fetch event data
        const eventRef = doc(collection(db, "events"), bookingData.eventId);
        const eventDoc = await getDoc(eventRef);
        if (!eventDoc.exists()) {
          setError("Event not found");
          setLoading(false);
          return;
        }
        const eventData = eventDoc.data();
        setEvent(eventData);

        // Fetch stadium data only after event data is available
        if (eventData.stadium_id) {
          const stadiumRef = doc(
            collection(db, "stadiums"),
            eventData.stadium_id
          );
          const stadiumDoc = await getDoc(stadiumRef);
          if (stadiumDoc.exists()) {
            setStadium(stadiumDoc.data());
          }
        }

        // Fetch category data
        const categoryRef = doc(
          collection(db, "stadium_categories"),
          bookingData.categoryId
        );
        const categoryDoc = await getDoc(categoryRef);
        if (categoryDoc.exists()) {
          setCategory(categoryDoc.data());
        }

        // Fetch tickets based on bookingId
        const ticketRef = collection(db, "tickets");
        const ticketQuery = query(
          ticketRef,
          where("bookingId", "==", bookingId)
        );
        const ticketSnapshot = await getDocs(ticketQuery);

        if (ticketSnapshot.empty) {
          toast.error("Payment incomplete. Please complete your booking.");
          navigate(
            `/seatbook/${bookingData.eventId}/${bookingData.categoryId}`
          );
          return;
        }

        const ticketsData = ticketSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTickets(ticketsData);

        // Fetch payment based on bookingId
        const paymentRef = collection(db, "payments");
        const paymentQuery = query(
          paymentRef,
          where("bookingId", "==", bookingId)
        );
        const paymentSnapshot = await getDocs(paymentQuery);

        if (!paymentSnapshot.empty) {
          const paymentData = paymentSnapshot.docs[0].data();
          setPayment({ id: paymentSnapshot.docs[0].id, ...paymentData });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching ticket details");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && currentUser) {
      fetchData();
    }
  }, [bookingId, currentUser, navigate]);

  const formattedEventDate = event?.date_time
    ? new Date(event.date_time).toLocaleDateString()
    : "Not available";
  const formattedEventTime = event?.date_time
    ? new Date(event.date_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  return (
    <div className="ticket-container">
      <Navbar />
      <div className="ticket-content">
        <h1>Ticket Details</h1>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="ticket-details">
            <div className="ticket-grid">
              {tickets.map((ticket, index) => (
                <div key={ticket.id} className="ticket-wrapper">
                  <div
                    className="e-ticket-card"
                    ref={(el) => (ticketRefs.current[index] = el)}
                  >
                    <div className="ticket-inner">
                      <div className="ticket-left">
                        <div className="ticket-header">
                          <span className="ticket-number">
                            SL.No. {String(index + 1).padStart(5, "0")}
                          </span>
                          <span className="admit">ADMIT ONE</span>
                        </div>
                        <div className="main-head">
                          <span className="event-name">{event.event_name}</span>
                        </div>
                        <div className="teams-section">
                          <h4>{event?.team1}</h4>
                          <span className="vs">VS</span>
                          <h4>{event?.team2}</h4>
                        </div>
                        <div className="match-details">
                          <p>{formattedEventDate}</p>
                          <p>{formattedEventTime}</p>
                          <p>{stadium?.stadium_name}</p>
                          <p>{stadium?.location}</p>
                        </div>
                        <div className="price-section">
                          <span className="price-tag">Price</span>
                          <span className="price-value">
                            ₹{category?.base_price}
                          </span>
                        </div>
                        <div className="ticket-footer">
                          <div className="entry-details">
                            <span>Stand: {category?.category_name}</span>
                            <span>
                              <p>Section: {ticket.seat.split("-")[0]}</p>
                              <p>Row: {ticket.seat.split("-")[1]}</p>
                              <p>Seat: {ticket.seat.split("-")[2]}</p>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ticket-right">
                        <div className="ticket-header">
                          <span className="ticket-number">
                            SL.No. {String(index + 1).padStart(5, "0")}
                          </span>
                          <span className="admit">ADMIT ONE</span>
                        </div>
                        <div className="teams-section-small">
                          <p>
                            {event?.team1} vs {event?.team2}
                          </p>
                        </div>
                        <div className="match-time">
                          <p>{formattedEventTime}</p>
                        </div>
                        <div className="venue-section">
                          <p>
                            {stadium?.stadium_name}, {stadium?.location}
                          </p>
                          <p>{formattedEventDate}</p>
                        </div>
                        <div className="seat_qrcode">
                          <div className="seat-details">
                            <p>{category?.category_name}</p>
                            <p>Section: {ticket.seat.split("-")[0] || "N/A"}</p>
                            <p>Row: {ticket.seat.split("-")[1] || "N/A"}</p>
                            <p>Seat: {ticket.seat.split("-")[2] || "N/A"}</p>
                            <p className="price">
                              Price: ₹{category?.base_price}
                            </p>
                          </div>
                          <div className="qr-section">
                            <QRCodeSVG value={ticket.id} size={80} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => handleDownloadPDF(index)}
                  >
                    Download Ticket PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tickets;
