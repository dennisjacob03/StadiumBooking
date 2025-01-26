import React from "react";
import Navbar from "./Components/Navbar/Navbar";
import Hero from "./Components/Hero/Hero";
import Events from "./Components/Events/Events";
import { Footer } from "./Components/Footer/Footer";

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="container">
        <Events />
      </div>
      <Footer />
    </div>
  );
};

export default App;
