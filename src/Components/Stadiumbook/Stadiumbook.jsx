import React from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./Stadiumbook.css";

const Stadiumbook = () => {
  return (
    <div className="stadiumbook">
      <Navbar />
      <div className="layout">
        <div className="mainhead">
          <h2 className="stadium-title">Stadium Seating Layout</h2>
        </div>
        <div className="stadium-layout container">
          <div className="inner-circle">Field</div>
          <div className="middle-ring">
            <div className="stand west side">West Stand</div>
            <div className="stand east side">East Stand</div>
            <div className="stand north">North Stand</div>
            <div className="stand south">South Stand</div>
          </div>
          <div className="outer-ring">
            <div className="stand-outer west-outer side">West Upper Stands</div>
            <div className="stand-outer east-outer side">East Upper Stands</div>
            <div className="stand-outer north-outer">North Upper Stands</div>
            <div className="stand-outer south-outer">South Upper Stands</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Stadiumbook;
