import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Ownernavbar from "../Ownernavbar/Ownernavbar";
import "./Ownerevents.css";

const Ownerevents = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [editedEvent, setEditedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    sport: "",
    team1: "",
    team2: "",
    date_time: "",
    description: "",
    event_poster: "",
    status: "Pending",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("ownerId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        const eventList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events.");
      }
      setLoading(false);
    };
    fetchEvents();
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent((prev) => ({ ...prev, event_poster: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = async () => {
    if (
      !newEvent.event_name ||
      !newEvent.sport ||
      !newEvent.team1 ||
      !newEvent.team2 ||
      !newEvent.date_time ||
      !newEvent.description ||
      !newEvent.event_poster
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "events"), {
        ...newEvent,
        ownerId: currentUser.uid,
        createdAt: new Date(),
      });
      setEvents([...events, { id: docRef.id, ...newEvent }]);
      setNewEvent({
        event_name: "",
        sport: "",
        team1: "",
        team2: "",
        date_time: "",
        description: "",
        event_poster: "",
        status: "Pending",
      });
      toast.success("Event added successfully! Awaiting admin approval.");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event.");
    }
  };
	
		const handleEdit = (event) => {
			setEditMode(event.id);
			setEditedEvent(event);
		};
	
		const handleSave = async () => {
			if (!editedEvent) return;
			try {
				const eventRef = doc(db, "events", editedEvent.id);
				await updateDoc(eventRef, editedEvent);
				setEvents(events.map((e) => (e.id === editedEvent.id ? editedEvent : e)));
				setEditMode(null);
				toast.success("Event updated successfully!");
			} catch (error) {
				console.error("Error updating event:", error);
				toast.error("Failed to update event.");
			}
		};
	
		const handleDelete = async (id) => {
			try {
				await deleteDoc(doc(db, "events", id));
				setEvents(events.filter((event) => event.id !== id));
				toast.success("Event deleted successfully!");
			} catch (error) {
				console.error("Error deleting event:", error);
				toast.error("Failed to delete event.");
			}
		};

  return (
    <div className="ownerevents">
      <Ownernavbar />
      <div className="events-container">
        <h2>Manage Your Events</h2>

        <div className="add-event">
          <input
            type="text"
            placeholder="Event Name"
            value={newEvent.event_name}
            onChange={(e) =>
              setNewEvent({ ...newEvent, event_name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Sport"
            value={newEvent.sport}
            onChange={(e) =>
              setNewEvent({ ...newEvent, sport: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Team 1"
            value={newEvent.team1}
            onChange={(e) =>
              setNewEvent({ ...newEvent, team1: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Team 2"
            value={newEvent.team2}
            onChange={(e) =>
              setNewEvent({ ...newEvent, team2: e.target.value })
            }
          />
          <input
            type="datetime-local"
            value={newEvent.date_time}
            onChange={(e) =>
              setNewEvent({ ...newEvent, date_time: e.target.value })
            }
          />
          <textarea
            placeholder="Description"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button className="add-btn" onClick={handleAddEvent}>
            Add Event
          </button>
        </div>

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
                    />
                  </td>
                  <td>
                    {editMode === event.id ? (
                      <input
                        type="text"
                        value={editedEvent.event_name}
                        onChange={(e) =>
                          setEditedEvent({
                            ...editedEvent,
                            event_name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      event.event_name
                    )}
                  </td>
                  <td>
                    {editMode === event.id ? (
                      <input
                        type="text"
                        value={editedEvent.sport}
                        onChange={(e) =>
                          setEditedEvent({
                            ...editedEvent,
                            sport: e.target.value,
                          })
                        }
                      />
                    ) : (
                      event.sport
                    )}
                  </td>
                  <td>
                    {editMode === event.id ? (
                      <>
                        <input
                          type="text"
                          value={editedEvent.team1}
                          onChange={(e) =>
                            setEditedEvent({
                              ...editedEvent,
                              team1: e.target.value,
                            })
                          }
                        />
                        {" vs "}
                        <input
                          type="text"
                          value={editedEvent.team2}
                          onChange={(e) =>
                            setEditedEvent({
                              ...editedEvent,
                              team2: e.target.value,
                            })
                          }
                        />
                      </>
                    ) : (
                      `${event.team1} vs ${event.team2}`
                    )}
                  </td>
                  <td>
                    {editMode === event.id ? (
                      <input
                        type="datetime-local"
                        value={editedEvent.date_time}
                        onChange={(e) =>
                          setEditedEvent({
                            ...editedEvent,
                            date_time: e.target.value,
                          })
                        }
                      />
                    ) : (
                      new Date(event.date_time).toLocaleString()
                    )}
                  </td>
                  <td className="description-cell">
                    {editMode === event.id ? (
                      <textarea
                        value={editedEvent.description}
                        onChange={(e) =>
                          setEditedEvent({
                            ...editedEvent,
                            description: e.target.value,
                          })
                        }
                        style={{ maxHeight: "100px", overflowY: "auto" }} // Scrollable description
                      />
                    ) : (
                      <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="status"><span>{event.status}</span></td>
                  <td className="actions">
                    {editMode === event.id ? (
                      <button onClick={handleSave} className="save">
                        <i class="material-icons save">save</i>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(event)}
                        className="edit"
                      >
                        <i class="material-icons edit">edit</i>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="delete"
                    >
                      <i class="material-icons delete">delete</i>
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

export default Ownerevents;
