import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
    // Add a simple fade-in effect
    useEffect(() => {
        const element = document.getElementById('privacy-policy');
        element.classList.add('fade-in');
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-10">
            <style>{`
                #privacy-policy {
                    opacity: 0;
                    transition: opacity 0.7s ease-in;
                }
                .fade-in {
                    opacity: 1 !important;
                }
            `}</style>

            <div
                id="privacy-policy"
                className="container mx-auto w-full max-w-3xl p-6 bg-gray-800 text-white rounded-lg shadow-lg transition-opacity duration-700"
            >
                <h1 className="text-4xl font-bold mb-6 text-center text-blue-400 animate-bounce">
                    Privacy Policy - NEXUS
                </h1>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Introduction</h2>
                    <p className="mb-4">
                        At Nexus, your privacy is our priority. This Privacy Policy outlines how we collect, use, 
                        and protect your information when you use our platform.
                    </p>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Information We Collect</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Personal Information: Includes your name, email address, and contact information.</li>
                        <li>Account Data: Information related to your account, including login credentials.</li>
                        <li>Usage Data: Information about how you interact with our platform.</li>
                    </ul>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">How We Use Your Information</h2>
                    <p className="mb-4">
                        Nexus uses your information for various purposes, including:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>To provide and maintain our services.</li>
                        <li>To notify you about changes to our services.</li>
                        <li>To allow you to participate in interactive features.</li>
                        <li>To provide customer support and respond to inquiries.</li>
                    </ul>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Data Security</h2>
                    <p className="mb-4">
                        We prioritize the security of your data. We implement various security measures to protect 
                        your information from unauthorized access, use, or disclosure.
                    </p>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Your Rights</h2>
                    <p className="mb-4">
                        You have the right to:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Access the personal information we hold about you.</li>
                        <li>Request corrections to your information.</li>
                        <li>Request deletion of your personal data.</li>
                        <li>Opt out of marketing communications.</li>
                    </ul>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Changes to This Privacy Policy</h2>
                    <p className="mb-4">
                        We may update our Privacy Policy from time to time. We will notify you of any changes 
                        by posting the new Privacy Policy on this page.
                    </p>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions about this Privacy Policy, please contact us at:
                        <br />
                        <strong>Email:</strong> support@nexus.com
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
