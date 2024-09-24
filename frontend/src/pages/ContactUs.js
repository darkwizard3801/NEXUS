import React, { useState } from 'react';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        let formErrors = {};
        if (!formData.name) formErrors.name = "Name is required.";
        if (!formData.email) {
            formErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            formErrors.email = "Email address is invalid.";
        }
        if (!formData.subject) formErrors.subject = "Subject is required.";
        if (!formData.message) formErrors.message = "Message is required.";
        return formErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length === 0) {
            console.log('Form data submitted:', formData);
            alert("Thank you for contacting us!");
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-semibold text-center mb-6">Contact Us</h1>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded shadow-lg">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="subject">Subject</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded h-32"
                    />
                    {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                </div>

                <div className="text-center">
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactUs;
