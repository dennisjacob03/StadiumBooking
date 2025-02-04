import React from 'react'
import './Hero.css'

const Hero = () => {
	return (
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
                <input type="text" placeholder="Search for Sports" />
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
                  <option value="thiruvananthapuram">Thiruvananthapuram</option>
                </select>
              </div>
              <div className="vl"></div>
              <div className="other-filter">
                <div className="img">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
                <span className="type">Date</span>
                <input type="date" className='date'/>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero