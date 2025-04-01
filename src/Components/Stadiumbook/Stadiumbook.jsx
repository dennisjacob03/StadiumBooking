import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { db } from "../../firebase";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import "./Stadiumbook.css";
import Stadiumrgics from "../Stadiumrgics/Stadiumrgics";

const Stadiumbook = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [stadiums, setStadiums] = useState({});
  const [loading, setLoading] = useState(true);

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
        toast.error("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const renderStadiumLayout = () => {
    if (!event || !event.stadium_id || Object.keys(stadiums).length === 0) {
      return <p>Stadium layout not found.</p>;
    }

    const stadiumName = stadiums[event.stadium_id]?.name;

    switch (stadiumName) {
      case "Rajiv Gandhi International Cricket Stadium":
        return <Stadiumrgics eventId={eventId} />;
      // case "Wankhede stadium":
      //   return <Stadiumrgics eventId={eventId} />;
      // case "Rajiv Gandhi International Cricket Stadium":
      //   return <Stadiumrgics eventId={eventId} />;
      // case "Greenfield International Stadium":
      //   return <Stadiumrgics eventId={eventId} />;
      default:
        return <p>Stadium layout not available for this stadium.</p>;
    }
  };

  return (
    <div className="stadiumbook">
      <Navbar />
      <div className="layout">
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
        <div className="stadium-layout container">
          {loading ? <p>Loading stadium layout...</p> : renderStadiumLayout()}
          <div className="color-box">
            <div className="color"></div>
            <p>Not available</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Stadiumbook;
