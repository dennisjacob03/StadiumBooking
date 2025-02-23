import React from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Home.css";
import event1 from "../../assets/event1.jpg";
import event2 from "../../assets/event2.jpg";
import event3 from "../../assets/event3.jpg";
import event4 from "../../assets/event4.jpg";
import event5 from "../../assets/event5.jpg";
import event6 from "../../assets/event6.jpg";
import event7 from "../../assets/event7.jpg";
import event8 from "../../assets/event8.jpg";


const Home = () => {
  return (
    <div className="home">
      <Navbar></Navbar>

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
          <div className="event">
            <img src={event1} alt="" />
          </div>
          <div className="event">
            <img src={event2} alt="" />
          </div>
          <div className="event">
            <img src={event3} alt="" />
          </div>
          <div className="event">
            <img src={event4} alt="" />
          </div>
          <div className="event">
            <img src={event5} alt="" />
          </div>
          <div className="event">
            <img src={event6} alt="" />
          </div>
          <div className="event">
            <img src={event7} alt="" />
          </div>
          <div className="event">
            <img src={event8} alt="" />
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Home;
