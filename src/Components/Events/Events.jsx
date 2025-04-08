import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import Adminnavbar from "../Adminnavbar/Adminnavbar";
import { toast } from "react-toastify";
import "./Events.scss";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventsAndStadiums = async () => {
      try {
        // Fetch events
        const eventsRef = query(
          collection(db, "events"),
          where("status", "==", 1)
        );
        const eventsSnapshot = await getDocs(eventsRef);
        const eventList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort events by date_time
        const sortedEvents = eventList.sort(
          (a, b) => new Date(a.date_time) - new Date(b.date_time)
        );

        // Fetch stadiums
        const stadiumsRef = collection(db, "stadiums");
        const stadiumsSnapshot = await getDocs(stadiumsRef);
        const stadiumData = {};
        stadiumsSnapshot.docs.forEach((doc) => {
          stadiumData[doc.id] = doc.data().stadium_name;
        });

        setEvents(sortedEvents);
        setStadiums(stadiumData);
      } catch (error) {
        console.error("Error fetching events or stadiums:", error);
        toast.error("Failed to load events.");
      }
      setLoading(false);
    };

    fetchEventsAndStadiums();
  }, []);

  const handleStatusChange = async (eventId, approval) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, { approval });
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, approval } : event
        )
      );
      toast.success(`Event marked as ${approval}`);
    } catch (error) {
      console.error("Error updating event status:", error);
      toast.error("Failed to update event status.");
    }
  };

  return (
    <div className="events">
      <Adminnavbar />
      <div className="events-container">
        <h2>Manage Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SI No.</th>
                <th>Event Poster</th>
                <th>Event Name</th>
                <th>Sport</th>
                <th>Teams</th>
                <th>Stadium</th>
                <th>Date & Time</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={event.event_poster}
                      alt={event.event_name}
                      className="event-poster"
                      style={{ width: "50px", height: "50px" }}
                    />
                  </td>
                  <td>{event.event_name}</td>
                  <td>{event.sport}</td>
                  <td>
                    {event.team1} vs {event.team2}
                  </td>
                  <td>{stadiums[event.stadium_id] || "Unknown Stadium"}</td>
                  <td>{new Date(event.date_time).toLocaleString()}</td>
                  <td>
                    <div className="description-cell">{event.description}</div>
                  </td>

                  <td>{event.approval}</td>
                  <td>
                    <button
                      onClick={() => handleStatusChange(event.id, "Approved")}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(event.id, "Disapproved")
                      }
                      className="disapprove-btn"
                    >
                      Disapprove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Events;
