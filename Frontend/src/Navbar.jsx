import React,{useContext} from "react";
import './css/navbar.css'
import usericon from './assets/user-solid.svg'
import bookicon from './assets/bookmark-solid.svg'
import { Link, useLocation  } from "react-router-dom";
import AuthContext from "./context/AuthContext";


export default function Navbar() {
    let { name } = useContext(AuthContext);
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' ||  location.pathname === '/upload';

    return (
        <>
            <nav className="navbar">
                <div className="nav-items">
                    <div className="header-div">
                        <Link to={'/'}><h1 className="header">SHOPIET</h1></Link>
                    </div>
                   
                        <div className="items"> {!isAuthPage && (
                            <div className="search-div">
                                <input className="search" type="search" placeholder="I'm looking for..." name="nav-search" id="" />
                            </div>)}
                            <div className="account-actions">
                                <div className="save-div">
                                    <button className="save"><img className="book-icon" src={bookicon} alt="" /></button>
                                </div>
                                <div className="sign-div">
                                    <Link to={'/login'}>
                                        <button className="sign-in"><img className="user-icon" src={usericon} alt="" /></button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    
                </div>
            </nav>
            {!isAuthPage && (
                <nav className="quicknav">
                    <ul>
                        <li>TECH</li>
                        <li>Furniture</li>
                        <li>Car Parts</li>
                        <li>Jewelery</li>
                        <li>Books</li>
                        <li>Sports</li>
                        <li>Electronics</li>
                        <li>Gardening</li>
                        <li>Gym Equipment</li>
                        <li>Toys</li>
                        <li>Kids</li>
                        <li>Car Accesories</li>
                    </ul>
                </nav>
            )}
        </>
    )
}