// src/pages/VerifyEmail.js
import React, { useEffect } from 'react';

const VerifyEmail = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Try multiple methods to close the window
            try {
                window.close();
                window.open('', '_self').close();
                window.location.href = 'about:blank';
                window.top.close();
            } catch (e) {
                // If all close attempts fail, redirect to home
                window.location.href = '/';
            }
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 transition duration-500 ease-in-out transform hover:scale-105">
            <h1 className="text-3xl font-bold mb-4 animate-bounce">Email Verification</h1>
            <p className="text-lg mb-2">An email has been sent to your email address. Please check your email and verify your account.</p>
            <p className="text-md text-gray-600">This tab will automatically close in 15 seconds.</p>
            <div className="animate-pulse mt-4">
                <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8 8 8 0 0013.18 6.45l3.73 3.73a1 1 0 001.41-1.41l-3.73-3.73A8 8 0 0010 2zm0 2a6 6 0 00-6 6 6 6 0 0011.31 3.67l1.54 1.54-2.83 2.83-1.54-1.54A6 6 0 0010 4z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

export default VerifyEmail;
