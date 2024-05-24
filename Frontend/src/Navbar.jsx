import React, { useContext, useState } from "react";
import './css/navbar.css'
import usericon from './assets/user-solid.svg'
import bookicon from './assets/bookmark-solid.svg'
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "./context/AuthContext";

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [hintVisible, setHintVisible] = useState('invisible');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/update-profile' || location.pathname === '/item/:slug' || location.pathname === '/signup' || location.pathname === '/upload' || location.pathname === '/profile/:username';
    

    const fetchSearchResults = async (query) => {
        try {
            setIsLoading(true)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search/${query}`);
            const data = await response.json();
            
            setSearchResults(data); setIsLoading(false)
        } catch (error) {
            console.error('Error fetching search results:', error);
            setIsLoading(false)
        }
    };

    const handleSearchChange = (event) => {
        const { value } = event.target; setSearchQuery(value);
        
        if (value.length >  2){
        setHintVisible('')
            
        fetchSearchResults(value);
        }else{
            setHintVisible('invisible')
        }
       
    };
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          
            navigate(`/search/${searchQuery}`);
            setSearchResults([])
            setHintVisible('invisible')
        }
    };
    return (
        <>
            <nav className="navbar">
                <div className="nav-items">
                    <div className="header-div">
                        <Link to={'/'}><h1 className="header">SHOPIET</h1></Link>
                    </div>

                    <div className="items"> {!isAuthPage && (
                        <div className="search-div">
                            <input
                                className="search"
                                type="search"
                                placeholder="I'm looking for..."
                                name="nav-search"
                                id=""
                                value={searchQuery}
                                onChange={ handleSearchChange}
                                onKeyDown={handleKeyPress}
                            />
                      
                      {
    <ul className={`search-hints ${hintVisible}`}>
        {searchResults.map(item => (
            <Link to={`search/${item.item_name}`} onClick={()=> { setSearchResults([]); setHintVisible('invisible'); }}><li key={item.id}>{isLoading  ? 'Looking...':item.item_name}</li></Link>
        ))}
    </ul>
}
                        </div>)}
                        <div className="account-actions">
                            <div className="save-div">
                            <Link to={`saved-items/${user.username}`}>
                                <button className="save"><img className="book-icon" src={bookicon} alt="" /></button>
                            </Link> </div>
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
                        <Link to={'/'}> <li>Home</li>   </Link>
                        <Link to={'category/Tech'}> <li>TECH</li>   </Link>
                        <Link to={'category/Furniture'}>    <li>Furniture</li> </Link>
                        <Link to={'category/Car Parts'}>    <li>Car Parts</li> </Link>
                        <Link to={'category/Jewelery'}>    <li>Jewelery</li></Link>
                        <Link to={'category/Books'}>   <li>Books</li></Link>
                        <Link to={'category/Sports'}>    <li>Sports</li></Link>
                        <Link to={'category/Electronics'}>    <li>Electronics</li></Link>
                        <Link to={'category/Gardening'}>    <li>Gardening</li></Link>
                        <Link to={'category/Gym Equipment'}>    <li>Gym Equipment</li></Link>
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
