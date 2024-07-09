import { useLocation } from "react-router-dom";


export default function Footer() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/chat/:username' || location.pathname === '/update-profile'|| location.pathname === '/conversations/:username' || location.pathname === '/item/:slug' || location.pathname === '/signup' || location.pathname === '/upload' || location.pathname === '/profile/:username';
  return (
    <>
    { !isAuthPage ? 
      <footer>
        {/* Footer heading */}
        <h1>SHOP IT!</h1>
        
        {/* Subheading  */}
   
      
        {/* Legal section */}
        <div className="legal">
          <h2>Find Anything You'd Sell</h2>
          <p className="copy-right">&copy; {new Date().getFullYear()} SHOPIET. All rights reserved. Designed and developed by 
            <a className="austin-portfolio" href="https://austinmaturure.netlify.app" target="_blank" rel="noopener noreferrer">⚡</a></p>
         
        </div> 
      </footer>:<></>}
    </>
  );
}
