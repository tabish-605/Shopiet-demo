import React from "react";
import './css/navbar.css'
import usericon from './assets/user-solid.svg'
import bookicon from './assets/bookmark-solid.svg'


export default function Navbar(){
    return(
        <>
        <nav className="navbar">
            <div className="nav-items">
                <div className="header-div">
                    <h1 className="header">SHOPIET</h1>
                </div>
                    
                
                <div className="items">
                    <div className="search-div">
                        <input className="search" type="search" placeholder="I'm looking for..." name="nav-search" id="" />  
                    </div>
                    
                  
                    
                    
                </div>
                     
               <div className="account-actions">
                <div className="save-div">
                        <button className="save"><img className="book-icon"src={bookicon} alt="" /></button>
                    </div>
                <div className="sign-div">
                       <button className="sign-in"><img className="user-icon"src={usericon} alt="" /></button> 
                    </div>
                    
               
            </div>
               </div>
                
            

        </nav>
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
        
        </>
    )
}