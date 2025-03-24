import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCity, setSelectedCity] = useState("all");
	const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(
          eventsRef,
          where("status", "==", 1),
          where("approval", "==", "Approved")
        );
        const snapshot = await getDocs(q);
        const eventList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const stadiumsRef = collection(db, "stadiums");
        const stadiumsSnapshot = await getDocs(stadiumsRef);
        const stadiumData = {};
        stadiumsSnapshot.docs.forEach((doc) => {
          stadiumData[doc.id] = {
            name: doc.data().stadium_name,
            city: doc.data().location.toLowerCase(),
          };
        });

        setStadiums(stadiumData);
        setEvents(eventList);
        setFilteredEvents(eventList); // Initially, show all events
      } catch (error) {
        toast.error("Error fetching events:", error);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

	const handleSearch = (e) => {
    e.preventDefault();
    let filtered = events;

    // Search by sport, event name, or team name
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((event) => {
        const stadiumName = stadiums[event.stadium_id]?.name || "";
				const stadiumCity = stadiums[event.stadium_id]?.city || "";
        return (
          event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stadiumName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					stadiumCity.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by city (if not 'all')
    if (selectedCity !== "all") {
      filtered = filtered.filter(
        (event) =>
          stadiums[event.stadium_id]?.city === selectedCity.toLowerCase()
      );
    }

    // Filter by date
    if (selectedDate !== "") {
      filtered = filtered.filter(
        (event) => event.date_time.split("T")[0] === selectedDate
      );
    }

    setFilteredEvents(filtered);
  };
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
              <form className="form-items" onClick={handleSearch}>
                <div className="search">
                  <input
                    type="search"
                    placeholder="Search for Sports, Teams, Stadiums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                  <select
                    className="select-bar"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
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
                  <input
                    type="date"
                    className="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="event-box container">
        <div className="events">
          {loading ? (
            <span className="loading">
              <p>Loading events...</p>
            </span>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div className="event" key={event.id}>
                <Link to={`/eventdetails/${event.id}`}>
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
                      <p>
                        {stadiums[event.stadium_id]?.name || "Unknown Stadium"}{" "}
                        - {stadiums[event.stadium_id]?.city || "Unknown City"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>No events found for your search criteria.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
