import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Link } from "react-router-dom";

import "./Eventdetails.css";

const Eventdetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        } else {
          console.error("Event not found");
        }
      } catch (error) {
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
        console.error("Error fetching stadiums:", error);
      }
    };

    Promise.all([fetchEventDetails(), fetchStadiums()]).then(() =>
      setLoading(false)
    );
  }, [eventId]);

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
                    <p>Price: ₹{event.base_price}</p>
                  </div>
                  <Link to={`/stadiumbook`}>
                    <button onClick={handleBook} className="btn book-btn">
                      BOOK NOW
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
