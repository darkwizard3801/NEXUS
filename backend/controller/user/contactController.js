const nodemailer = require('nodemailer');
const ContactMessage = require('../../models/ContactMessage');

// Contact form submission handler
const handleContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation (this could also be done in frontend)
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Save the contact message to the database
    const newContactMessage = new ContactMessage({
        name,
        email,
        subject,
        message
    });

    try {
        await newContactMessage.save();  // Save to database
        
        // Create the email transporter using your email provider (like Gmail)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASSWORD  // your email app password
            }
        });

        // Email options
        const mailOptions = {
            from: email, // sender's email
            to: 'phoenix.nexus.2024@gmail.com', // your email or support email
            subject: `New Contact Form Submission: ${subject}`,
            text: `You have received a new message from ${name} (${email}).\n\nMessage:\n${message}`
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: 'Your message has been sent!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send message or save to database. Please try again later.' });
    }
};

// Fetch all contact messages for the admin dashboard
const getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ date: -1 }); // Sort by newest first
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

module.exports = { handleContactForm, getAllContactMessages };



