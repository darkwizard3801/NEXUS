const Testimonial = require('../../models/testimonialModel');

const testimonialController = {
  // Add a new testimonial
  addTestimonial: async (req, res) => {
    try {
      const { text, userEmail, userName, userProfile, timestamp, vendorEmail } = req.body;

      // Validate required fields
      if (!text || !userEmail || !userName || !vendorEmail) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields"
        });
      }

      // Create new testimonial
      const newTestimonial = new Testimonial({
        text,
        userEmail,
        userName,
        userProfile,
        timestamp,
        vendorEmail
      });

      // Save testimonial
      await newTestimonial.save();

      res.status(201).json({
        success: true,
        message: "Testimonial added successfully",
        data: newTestimonial
      });

    } catch (error) {
      console.error('Error in addTestimonial:', error);
      res.status(500).json({
        success: false,
        message: "Error adding testimonial",
        error: error.message
      });
    }
  },

  // Get testimonials for a specific vendor (Updated to handle POST request)
  getVendorTestimonials: async (req, res) => {
    try {
      const { userEmail } = req.body; // Changed from req.params to req.body

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          message: "Vendor email is required"
        });
      }

      const testimonials = await Testimonial.find({ vendorEmail: userEmail })
        .sort({ timestamp: -1 }); // Sort by newest first

      res.status(200).json({
        success: true,
        data: testimonials
      });

    } catch (error) {
      console.error('Error in getVendorTestimonials:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching testimonials",
        error: error.message
      });
    }
  }
};

module.exports = testimonialController;
