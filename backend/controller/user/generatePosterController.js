require('dotenv').config();
const axios = require('axios');
/**
 * Generate Poster Controller
 */
const generatePoster = async (req, res) => {
  try {
    const completeFormData = req.body;
    const photo = req.files?.photo; // Access uploaded file if exists

    // Debug log to check if API key is being read
    console.log('API Key:', process.env.STABILITY_API_KEY ? 'Present' : 'Missing');

    // Check if API key is configured and properly formatted
    if (!process.env.STABILITY_API_KEY) {
      throw new Error('Stability API key is not configured');
    }

    // Validate API key format (assuming it should be a non-empty string)
    if (typeof process.env.STABILITY_API_KEY !== 'string' || process.env.STABILITY_API_KEY.trim() === '') {
      throw new Error('Invalid API key format');
    }

    // Test API key with a simple validation request
    try {
      const validationResponse = await axios.get(
        'https://api.stability.ai/v1/user/balance',
        {
          headers: {
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          },
        }
      );
      console.log('API Key validation successful:', validationResponse.status === 200);
    } catch (validationError) {
      console.error('API Key validation failed:', validationError.response?.data || validationError.message);
      throw new Error('Invalid API key or authentication failed');
    }

    // Build base prompt based on event type
    let basePrompt = `Create a professional ${completeFormData.eventType} poster`;
    
    // Add poster type specification
    if (completeFormData.posterType) {
      basePrompt += ` in ${completeFormData.posterType} style`;
    }

    // Add theme and colors
    basePrompt += `. Theme: "${completeFormData.theme}". The poster should predominantly use ${completeFormData.primaryColor} with ${completeFormData.secondaryColor} as accent color.`;

    // Add event-specific details
    if (completeFormData.eventType === 'marriage' || completeFormData.eventType === 'wedding') {
      basePrompt += ` The poster is for the wedding celebration of ${completeFormData.brideName} and ${completeFormData.groomName}.`;
    } else if (completeFormData.eventType === 'baptism' || completeFormData.eventType === 'babyShower') {
      basePrompt += ` The event is in honor of ${completeFormData.individualName}.`;
    }

    // Add contact information
    basePrompt += ` The following contact information should be clearly visible: ${completeFormData.contactInfo}`;

    // Add any additional custom prompt
    if (completeFormData.prompt) {
      basePrompt += ` Additional specifications: ${completeFormData.prompt}`;
    }

    let requestBody = {
      text_prompts: [
        {
          text: basePrompt,
          weight: 1
        }
      ],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 3,
      steps: 30,
      style_preset: "photographic"
    };

    // If photo exists, add it as an init_image
    if (photo) {
      // Convert the uploaded image to base64
      const base64Image = photo.data.toString('base64');
      
      // Add image-specific parameters to the request
      requestBody = {
        ...requestBody,
        init_image: base64Image,
        init_image_mode: "IMAGE_STRENGTH",
        image_strength: 0.35, // Adjust this value between 0-1 to control how much the initial image influences the result
        steps: 50 // Increase steps for better results with image-to-image
      };
    }

    console.log('Sending prompt to Stability AI:', basePrompt);

    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.STABILITY_API_KEY.trim()}`, // Ensure no whitespace
        },
      }
    );

    const images = response.data.artifacts.map(image => 
      `data:image/png;base64,${image.base64}`
    );

    res.status(200).json({ 
      success: true,
      posters: images,
      prompt: basePrompt,
      message: 'Posters generated successfully'
    });

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    res.status(500).json({ 
      success: false,
      error: error.response?.data?.message || error.message,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        response: error.response?.data,
        apiKeyPresent: !!process.env.STABILITY_API_KEY
      } : undefined
    });
  }
};

module.exports = { generatePoster };
