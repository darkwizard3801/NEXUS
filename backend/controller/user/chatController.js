const { GoogleGenerativeAI } = require('@google/generative-ai');

const chatController = {
  handleMessage: async (req, res) => {
    try {
      console.log('1. Starting chat request handling...');
      
      const { message } = req.body;
      console.log('2. Received message:', message);

      // Check API key
      console.log('3. Checking API key...');
      if (!process.env.GEMINI_API_KEY) {
        console.error('API key is missing');
        throw new Error('API configuration is incomplete');
      }
      console.log('4. API key found');

      // Initialize API
      console.log('5. Initializing Gemini API...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('6. Gemini API initialized');

      // Get model
      console.log('7. Getting Gemini model...');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('8. Model retrieved');

      // Prepare comprehensive prompt
      console.log('9. Preparing prompt...');
      const prompt = `
        You are an AI assistant for an event management platform. You should provide helpful, friendly, and concise responses about our platform's features and capabilities.

        Platform Core Features:
        1. Event Creation and Management:
          - Create and customize events of any size
          - Multiple event types: weddings, corporate, birthdays, conferences
          - Timeline and checklist management
          - Guest list management and RSVP tracking
          - Budget planning and tracking tools

        2. Vendor Services:
          - Extensive vendor marketplace
          - Categories: catering, decoration, photography, videography
          - Venue selection and booking
          - Entertainment and music services
          - Equipment rental
          - Detailed vendor profiles with portfolios
          - Verified vendor ratings and reviews

        3. Booking and Payments:
          - Secure payment processing
          - Multiple payment methods accepted
          - Installment payment options
          - Automatic payment reminders
          - Refund and cancellation policies
          - Invoice and receipt management

        4. Communication Tools:
          - Direct messaging with vendors
          - Real-time chat support
          - Notification system
          - Event updates and announcements
          - Team collaboration tools

        5. Additional Features:
          - Mobile app availability
          - Custom event websites
          - Digital invitations
          - Photo and video sharing
          - Event day coordination
          - Weather backup planning
          - Vendor recommendations
          - Budget templates

        6. Security and Support:
          - 24/7 customer support
          - Secure data encryption
          - Vendor verification process
          - Dispute resolution
          - Insurance options
          - Data backup and recovery

        7. Pricing and Plans:
          - Free basic plan
          - Premium features available
          - Business accounts for vendors
          - Custom enterprise solutions
          - Seasonal promotions and discounts

        User Question: ${message}

        Please provide a clear, concise, and helpful response focusing on the aspects most relevant to the user's question. If the question is unclear, ask for clarification. If the question is about a feature we don't have, politely explain what alternatives we offer.
      `;
      console.log('10. Prompt prepared');

      // Generate content
      console.log('11. Generating content...');
      const result = await model.generateContent(prompt);
      console.log('12. Content generated');

      console.log('13. Getting response...');
      const response = await result.response;
      console.log('14. Response received');

      console.log('15. Extracting text...');
      const reply = response.text();
      console.log('16. Final reply:', reply);

      console.log('17. Sending success response...');
      res.status(200).json({
        success: true,
        reply
      });
      console.log('18. Success response sent');

    } catch (error) {
      console.error('ERROR DETAILS:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to process message',
        details: error.message
      });
    }
  }
};

module.exports = chatController;
