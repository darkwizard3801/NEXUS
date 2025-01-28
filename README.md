# Nexus - Event Management Platform

## Overview
Nexus is a comprehensive event management platform designed to streamline the planning and execution of events. It brings together vendors, clients, and event planners in one unified platform, offering powerful tools and intuitive interfaces for seamless event organization.

## Features

### For Clients
- User authentication and profile management
- Event browsing and booking
- Vendor discovery and comparison
- Real-time communication with vendors
- Event timeline tracking
- Budget management
- Review and rating system

### For Vendors
- Professional profile management
- Portfolio showcase
- Service listing and pricing
- Booking management
- Client communication
- Analytics dashboard
- Testimonial management

## Technology Stack
- Frontend: React.js with Tailwind CSS
- Backend: Node.js
- Database: MongoDB
- Authentication: JWT
- Cloud Storage: Cloudinary
- Payment Integration: Razorpay

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/nexus.git
cd nexus
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
### Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
TOKEN_SECRET_KEY=your-token-secret-key
EMAIL=your-email@example.com
EMAIL_PASSWORD=your-email-password

4. Start the development servers
```bash
# Start frontend
cd frontend
npm start

# Start backend
cd backend
npm start
```

## Project Structure
```
nexus/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── helpers/
│       └── common/
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    └── middleware/
```

## Key Components

### Vendor Page
- Dynamic portfolio display
- Testimonial management
- About section with responsive design
- Service showcase
- Contact information

### User Dashboard
- Event tracking
- Booking management
- Communication center
- Payment history

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE.md file for details

## Contact
Project Link: [https://github.com/darkwizard3801/nexus](https://github.com/darkwizard3801/nexus)

## Live Demo
Live Demo [https://nexus-frontend-lpfd.onrender.com/](https://nexus-frontend-lpfd.onrender.com/)

## Acknowledgments
- React Icons
- Tailwind CSS
- Framer Motion
- Chart.js
- React Router
