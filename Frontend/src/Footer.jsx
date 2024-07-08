

export default function Footer() {
  return (
    <>
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
      </footer>
    </>
  );
}
