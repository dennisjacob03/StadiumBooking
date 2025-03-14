import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Home.css";

const Home = () => {
  const [events, setEvents] = useState([]);
	const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("status", "==", 1));
        const snapshot = await getDocs(q);
        const eventList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
				const stadiumsRef = collection(db, "stadiums");
								const stadiumsSnapshot = await getDocs(stadiumsRef);
								const stadiumData = {};
								stadiumsSnapshot.docs.forEach((doc) => {
									stadiumData[doc.id] = doc.data().stadium_name;
								});
								
        setStadiums(stadiumData);
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="home">
      <Navbar />
      <div className="hero container">
        <div className="hero-combined">
          <div className="hero-text">
            <h1>BOOK YOUR</h1>
            <h1 className="text-slide">
              TICKETS FOR <span className="text-fade">SPORT</span>
            </h1>
          </div>
          <div className="filter">
            <div className="filter-form">
              <form className="form-items">
                <div className="search">
                  <input type="search" placeholder="Search for Sports" />
                  <button type="submit">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
                <div className="vl"></div>
                <div className="other-filter">
                  <div className="img">
                    <i className="fa-solid fa-city"></i>
                  </div>
                  <span className="type">City</span>
                  <select className="select-bar">
                    <option value="all">All</option>
                    <option value="ahmedabad">Ahmedabad</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="chennai">Chennai</option>
                    <option value="guwahati">Guwahati</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="kochi">Kochi</option>
                    <option value="kolkata">Kolkata</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="raipur">Raipur</option>
                    <option value="thiruvananthapuram">
                      Thiruvananthapuram
                    </option>
                  </select>
                </div>
                <div className="vl"></div>
                <div className="other-filter">
                  <div className="img">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <span className="type">Date</span>
                  <input type="date" className="date" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="event-box container">
        <div className="events">
          {loading ? (
            <p>Loading events...</p>
          ) : (
            events.map((event) => (
              <div className="event" key={event.id}>
                <div className="image-section">
                  <img src={event.event_poster} alt={event.event_name} />
                </div>
                <div className="content">
                  <p className="head">
                    {event.team1} vs {event.team2}
                    <br />| {event.sport}
                  </p>
                  <br />
									<div className="other-content">
										<i className="fa-solid fa-calendar-days"></i>
										<p>{new Date(event.date_time).toLocaleString()}</p>
									</div>
									<div className="other-content">
                    <i className="fa-solid fa-map-marker-alt"></i>
                  <p>{stadiums[event.stadium_id] || "Unknown Stadium"}
                  </p>
									</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
