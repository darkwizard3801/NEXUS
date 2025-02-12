// src/pages/VerifyEmail.js
import React, { useEffect } from 'react';

const VerifyEmail = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Try to close the tab using window.close()
            const closeTab = () => {
                // For modern browsers
                window.close();

                // For browsers that don't support window.close()
                // Create a new "blank" tab/window
                const win = window.open("", "_self");
                // Close it
                win.close();

                // If the above methods fail, try closing the current tab/window
                window.open('', '_self', '').close();

                // If all else fails, redirect to home
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            };

            // Create and trigger a custom close event
            const closeEvent = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': false
            });

            // Attempt to close using both methods
            closeTab();
            document.dispatchEvent(closeEvent);

        }, 6000);

        return () => clearTimeout(timer);
    }, []);

    // Add a click handler for manual closing
    const handleCloseClick = () => {
        window.close();
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 transition duration-500 ease-in-out transform hover:scale-105">
            <h1 className="text-3xl font-bold mb-4 animate-bounce">Email Verification</h1>
            <p className="text-lg mb-2">An email has been sent to your email address. Please check your email and verify your account.</p>
            <p className="text-md text-gray-600 mb-4">This tab will automatically close in 6 seconds.</p>
            
            {/* Added manual close button */}
            <button 
                onClick={handleCloseClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105 mb-4"
            >
                Close Tab Now
            </button>
            
            <div className="animate-pulse mt-4">
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8 8 8 0 0013.18 6.45l3.73 3.73a1 1 0 001.41-1.41l-3.73-3.73A8 8 0 0010 2zm0 2a6 6 0 00-6 6 6 6 0 0011.31 3.67l1.54 1.54-2.83 2.83-1.54-1.54A6 6 0 0010 4z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

export default VerifyEmail;
