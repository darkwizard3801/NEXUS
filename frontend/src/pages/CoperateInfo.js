import React, { useEffect } from 'react';

const CoperateInfo = () => {
    // Add a simple fade-in effect
    useEffect(() => {
        const element = document.getElementById('corporate-info');
        element.classList.add('fade-in');
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-10">
            <style>{`
                #corporate-info {
                    opacity: 0;
                    transition: opacity 0.7s ease-in;
                }
                .fade-in {
                    opacity: 1 !important;
                }
            `}</style>

            <div
                id="corporate-info"
                className="container mx-auto w-full max-w-3xl p-6 bg-gray-800 text-white rounded-lg shadow-lg transition-opacity duration-700"
            >
                <h1 className="text-4xl font-bold mb-6 text-center text-blue-400 animate-bounce">
                    Corporate Information - NEXUS
                </h1>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Mission</h2>
                    <p className="mb-4">
                        Our mission at Nexus is to simplify the event planning process by providing a user-friendly platform 
                        that connects users with verified vendors and efficient management tools, ensuring a seamless 
                        and enjoyable experience for all types of events.
                    </p>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Vision</h2>
                    <p className="mb-4">
                        We envision Nexus as the leading platform for event management, leveraging advanced technologies 
                        to continuously enhance user experiences and foster successful events globally.
                    </p>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Core Values</h2>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Integrity: Upholding honesty and transparency in all interactions.</li>
                        <li>Innovation: Continuously seeking new ways to improve our services.</li>
                        <li>Customer-Centric: Prioritizing the needs and feedback of our users.</li>
                        <li>Collaboration: Fostering partnerships with vendors and clients to achieve mutual success.</li>
                    </ul>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Corporate Structure</h2>
                    <p className="mb-4">
                        Nexus operates under a structured framework comprising key departments that work collaboratively 
                        to ensure smooth operations and exceptional service delivery:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li><strong>Product Development:</strong> Focuses on enhancing platform features and user interfaces.</li>
                        <li><strong>Marketing:</strong> Responsible for brand promotion, user acquisition, and community engagement.</li>
                        <li><strong>Customer Support:</strong> Provides assistance and resolves issues for users and vendors.</li>
                        <li><strong>Research and Development:</strong> Explores new technologies and trends to integrate into the platform.</li>
                    </ul>
                </section>

                <section className="mb-8 p-5 bg-gray-700 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <h2 className="text-3xl font-semibold mb-3 text-blue-300">Contact Information</h2>
                    <p className="mb-4">
                        For inquiries, partnerships, or support, please contact us at:
                        <br />
                        <strong>Email:</strong> support@nexus.com
                        <br />
                        <strong>Phone:</strong> +91 (123) 456-7890
                    </p>
                </section>
            </div>
        </div>
    );
};

export default CoperateInfo;
