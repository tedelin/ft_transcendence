import React, { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import '../styles/navbar.css';
import { useUser } from './AuthProvider';
import { useChatDispatch } from '../chat/ChatContext';
import { RouterProvider, createBrowserRouter, NavLink, Outlet } from 'react-router-dom'


export function NavBar() {
    // const dispatch = useChatDispatch();
    const user = useUser();

    function logout() {
        localStorage.removeItem('jwtToken');
    }

    return (
		<>
			<div className="navBar">
				<div className="navItems">
					{/* <span onClick={() => dispatch({ type: 'toggleSideBar' })} className="material-symbols-outlined">
						menu
					</span> */}
					<NavLink className="navBarItem" to="/">Home</NavLink>
					<NavLink className="navBarItem" to="/chat">Chat</NavLink>
					<NavLink className="navBarItem" to="/game">Game</NavLink>
				</div>
				{user.username && <div className="navUser">
					<img src="https://www.w3schools.com/howto/img_avatar.png" alt="User Avatar" />
					<span>{user ? user.username : "undefined"}</span>
					<button onClick={logout}>Logout</button>
				</div>}
			</div>
			<div className='container'>
				<Outlet/>
			</div>
		</>
    )
}