import React, { useEffect, useState } from 'react';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch contact messages from the backend using fetch
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('/admin/contact-messages', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch contact messages');
                }

                const data = await response.json();
                setMessages(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="contact-messages">
            <h2>Contact Messages</h2>
            {messages.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                <ul>
                    {messages.map((msg) => (
                        <li key={msg._id}>
                            <h3>{msg.subject}</h3>
                            <p><strong>From:</strong> {msg.name} ({msg.email})</p>
                            <p>{msg.message}</p>
                            <p><strong>Date:</strong> {new Date(msg.date).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ContactMessages;
