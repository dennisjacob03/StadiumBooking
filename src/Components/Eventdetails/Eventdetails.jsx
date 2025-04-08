import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Link } from "react-router-dom";
import "./Eventdetails.scss";

const Eventdetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);
  const [lowestPrice, setLowestPrice] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          setEvent(eventData);
        } else {
          toast.error("Event not found");
        }
      } catch (error) {
        toast.error("Error fetching event details");
        console.error("Error fetching event details:", error);
      }
    };

    const fetchStadiums = async () => {
      try {
        const stadiumsRef = collection(db, "stadiums");
        const snapshot = await getDocs(stadiumsRef);
        const stadiumData = {};
        snapshot.docs.forEach((doc) => {
          stadiumData[doc.id] = doc.data().stadium_name;
        });
        setStadiums(stadiumData);
      } catch (error) {
        toast.error("Error fetching stadiums");
				console.error("Error fetching stadiums:", error);

      }
    };

    Promise.all([fetchEventDetails(), fetchStadiums()]).then(() =>
      setLoading(false)
    );
  }, [eventId]);

  useEffect(() => {
    if (event?.stadium_id) {
      const fetchCategories = async () => {
        try {
          const categoriesRef = collection(db, "stadium_categories");
          const q = query(
            categoriesRef,
            where("stadium_id", "==", event.stadium_id)
          );
          const snapshot = await getDocs(q);
          const prices = snapshot.docs.map((doc) => doc.data().base_price);

          if (prices.length > 0) {
            setLowestPrice(Math.min(...prices));
          } else {
            setLowestPrice(null);
          }
        } catch (error) {
          toast.error("Error fetching categories.");
          console.error("Error fetching categories:", error);
        }
      };

      fetchCategories();
    }
  }, [event]); 
  function handleBook() {
    console.log("Booking process started...");
  }

  return (
    <div className="eventdetails">
      <Navbar />
      <div className="details container">
        {loading ? (
          <span className="loading">
            <p>Loading event details...</p>
          </span>
        ) : event ? (
          <div>
            <div className="detailed">
              <img src={event.event_poster} alt={event.event_name} />
              <div className="eventbook">
                <div className="head">
                  <p>
                    {event.event_name} - {event.team1} vs {event.team2}
                  </p>
                </div>
                <div className="other-content">
                  <i className="fa-solid fa-soccer-ball"></i>
                  {event.sport}
                </div>
                <div className="other-content">
                  <i className="fa-solid fa-calendar-days"></i>
                  {new Date(event.date_time).toLocaleString()}
                </div>
                <div className="other-content">
                  <i className="fa-solid fa-map-marker-alt"></i>
                  {stadiums[event.stadium_id] || "Unknown Stadium"}
                </div>
                <hr />
                <div className="main">
                  <div className="price">
                    <p>Price: ₹{lowestPrice !== null ? lowestPrice : "N/A"}</p>
                  </div>
                  <Link to={`/stadiumbook/${eventId}`}>
                    <button onClick={handleBook} className="btn book-btn">
                      BOOK TICKETS
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="about">
              <h2>About the event</h2>
              <p>{event.description}</p>
            </div>
          </div>
        ) : (
          <p>Event not found</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Eventdetails;
