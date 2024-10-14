import React from 'react';

const NotFound = () => {
  const page404Styles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#fff',
    fontFamily: "'Arvo', serif",
    textAlign: 'center',
  };

  const fourZeroFourBgStyles = {
    backgroundImage: 'url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)',
    height: '400px',
    width: '100%',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const h1Styles = {
    fontSize: '80px',
    color: '#fff',
    textShadow: '2px 2px 5px rgba(0,0,0,0.5)',
  };

  const h3Styles = {
    fontSize: '24px',
    margin: '20px 0',
  };

  const linkStyles = {
    color: '#fff',
    padding: '10px 20px',
    background: '#39ac31',
    margin: '20px 0',
    display: 'inline-block',
    textDecoration: 'none',
    borderRadius: '5px',
  };

  const contentBoxStyles = {
    marginTop: '20px',
  };

  return (
    <div style={page404Styles}>
      <div style={fourZeroFourBgStyles}>
        <h1 style={h1Styles}>404</h1>
      </div>
      <div style={contentBoxStyles}>
        <h3 style={h3Styles}>It looks like you're lost</h3>
        <p>The page you are looking for is not available!</p>
        <a href="/" style={linkStyles}>
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
