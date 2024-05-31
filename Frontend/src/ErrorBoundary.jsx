
import React from 'react';
import pnf from './assets/Busy.svg'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div style={{height:'100vh',height:'100svh', justifyContent:'center'}} className='flex-col'>
            <div className='error-div flex-col'> <div className="eimg-cnt">
              <img loading="lazy" src={pnf} id='error-404' className="item-detail-image" />
              </div></div>
            <h2>Something Unexpected Happened...</h2>
            <p>Please try going back <a style={{textDecoration:'underline 2px #8dc572'}} href="https://shopiet.netlify.app">HOME</a></p>
          </div>;
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
