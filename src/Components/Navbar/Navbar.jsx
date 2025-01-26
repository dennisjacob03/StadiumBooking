import React from 'react'
import './Navbar.css'
import logo from '../../assets/logowhite.png'

const Navbar = () => {
	return (
		<nav className='container'>
			<img src={logo} alt="SpotOn" className='logo'/>
			<ul>
				<li>Explore</li>
				<li>Favourites</li>
				<li>My Tickets</li>
				<li>Contact</li>
				<li><button className='btn'>SIGN IN</button></li>
			</ul>
		</nav>
	)
}

export default Navbar