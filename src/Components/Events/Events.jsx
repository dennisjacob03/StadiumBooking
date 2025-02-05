import React from 'react'
import './Events.css'
import event1 from '../../assets/event1.jpg'
import event2 from '../../assets/event2.jpg'
import event3 from '../../assets/event3.jpg'
import event4 from '../../assets/event4.jpg'
import event5 from '../../assets/event5.jpg'
import event6 from '../../assets/event6.jpg'
import event7 from '../../assets/event7.jpg'
import event8 from '../../assets/event8.jpg'
import event9 from '../../assets/event9.jpg'
import event10 from '../../assets/event10.jpg'
import event11 from '../../assets/event11.jpg'
import event12 from '../../assets/event12.jpg'

const Events = () => {
	return (
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
        <div className="event">
          <img src={event9} alt="" />
        </div>
        <div className="event">
          <img src={event10} alt="" />
        </div>
        <div className="event">
          <img src={event11} alt="" />
        </div>
        <div className="event">
          <img src={event12} alt="" />
        </div>
      </div>
    </div>
  );
}

export default Events