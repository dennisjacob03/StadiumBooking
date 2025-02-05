
import React from 'react'
import Navbar from "./Navbar/Navbar";
import Hero from "./Hero/Hero"
import Events from './Events/Events';
import Footer from "./Footer/Footer"
import "./Home.css"
const Home = () => {
	return (
		<div className='home'>
			<Navbar></Navbar>
			<Hero></Hero>
			<Events></Events>
			<Footer></Footer>
		</div>
	)
}

export default Home
