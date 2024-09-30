import React, { useEffect } from 'react';

const TermsAndConditions = () => {
    useEffect(() => {
        const element = document.getElementById('terms-conditions');
        element.classList.add('fade-in');
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-10">
            <style>{`
                #terms-conditions {
                    transform: translateY(20px);
                    opacity: 0;
                    transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
                }
                .fade-in {
                    transform: translateY(0);
                    opacity: 1 !important;
                }
            `}</style>

            <div
                id="terms-conditions"
                className="bg-gray-800 w-full max-w-3xl p-8 rounded-lg shadow-lg transition-transform duration-500 transform hover:scale-105 hover:shadow-2xl"
            >
                <h1 className="text-4xl font-extrabold mb-6 text-center text-white">
                    Terms and Conditions
                </h1>

                <p className="text-lg mb-4 text-gray-300">
                    Welcome to Nexus! By using our platform, you agree to comply with and be bound by these terms and conditions. Please read them carefully.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">1. Introduction</h2>
                    <p className="text-lg mb-4 text-gray-300">
                        These Terms and Conditions outline the rules and regulations for the use of our website and services. 
                        By accessing this website, we assume you accept these terms and conditions.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">2. User Responsibilities</h2>
                    <ul className="list-disc pl-6 mb-4 text-lg text-gray-300">
                        <li>You must provide accurate and complete information during registration.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You agree to notify us immediately of any unauthorized use of your account.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">3. User Content</h2>
                    <p className="text-lg mb-4 text-gray-300">
                        Any content you upload or post on our platform remains your property. However, you grant Nexus a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and publish that content.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">4. Termination</h2>
                    <p className="text-lg mb-4 text-gray-300">
                        We reserve the right to terminate your access to the platform without notice if you violate any of these terms and conditions.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">5. Limitation of Liability</h2>
                    <p className="text-lg mb-4 text-gray-300">
                        Nexus shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">6. Changes to Terms</h2>
                    <p className="text-lg mb-4 text-gray-300">
                        We may update our terms and conditions from time to time. You will be notified of any changes through our platform.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">7. Contact Us</h2>
                    <p className="text-lg mb-4 text-gray-300">
                        If you have any questions about these terms and conditions, please contact us at:
                        <br />
                        <strong className="text-gray-200">Email:</strong> support@nexus.com
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsAndConditions;
