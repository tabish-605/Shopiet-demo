import React,{useContext} from "react";
import './css/navbar.css'
import usericon from './assets/user-solid.svg'
import bookicon from './assets/bookmark-solid.svg'
import { Link, useLocation  } from "react-router-dom";
import AuthContext from "./context/AuthContext";


export default function Navbar() {
    let { profilePic } = useContext(AuthContext);
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/update-profile' || location.pathname === '/item/:slug' || location.pathname === '/signup' ||  location.pathname === '/upload';

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
                    <Link to={'category/Tech'}> <li>TECH</li>   </Link>
                    <Link to={'category/Furniture'}>    <li>Furniture</li> </Link>
                    <Link to={'category/Car Parts'}>    <li>Car Parts</li> </Link>
                    <Link to={'category/Jewelery'}>    <li>Jewelery</li></Link>
                    <Link to={'category/Books'}>   <li>Books</li></Link>
                    <Link to={'category/Sports'}>    <li>Sports</li></Link>
                    <Link to={'category/Electronics'}>    <li>Electronics</li></Link>
                    <Link to={'category/Gardening'}>    <li>Gardening</li></Link>
                    <Link to={'category/Gym equipment'}>    <li>Gym Equipment</li></Link>
                    <Link to={'category/Toys'}>    <li>Toys</li></Link>
                    <Link to={'category/Kids'}>    <li>Kids</li></Link>
                    <Link to={'category/Car accesories'}>    <li>Car Accesories</li></Link>
                    <Link to={'category/Audio'}>    <li>Audio</li></Link>
                    </ul>
                </nav>
            )}
        </>
    )
}