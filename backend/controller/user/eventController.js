const Event = require('../../models/eventModel'); // Import your Event model

// Create a new event
exports.createEvent = async (req, res) => {
  const { eventType, occasion, budget, guests, phoneNumber, date, location, email, username } = req.body;

  try {
    // Check if required fields are provided
    if (!eventType || !occasion || !budget || !guests || !phoneNumber || !date || !location || !email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create a new event instance
    const newEvent = new Event({
      eventType,
      occasion,
      budget,
      guests,
      phoneNumber,
      date,
      location,
      createdBy: {
        email,    // The email is coming from the frontend
        username, // The username is coming from the frontend
      },
    });

    // Save the event to the database
    await newEvent.save();

    // Respond with success message and the created event
    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event: {
        id: newEvent._id,
        eventType: newEvent.eventType,
        occasion: newEvent.occasion,
        budget: newEvent.budget,
        guests: newEvent.guests,
        phoneNumber: newEvent.phoneNumber,
        date: newEvent.date,
        location: newEvent.location,
        createdBy: newEvent.createdBy,
      },
    });
  } catch (error) {
    console.error('Error creating event:', error);

    // Handle any specific error related to the database or request
    res.status(500).json({
      success: false,
      message: 'There was an error creating the event. Please try again later.',
      error: error.message,
    });
  }
};

// Fetch all events
exports.getEvents = async (req, res) => {
  try {
    // Fetch all events from the database
    const events = await Event.find();

    // Check if events exist
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No events found',
      });
    }

    // Respond with the list of events
    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);

    // Handle error if fetching events fails
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

// Update event status
exports.updateEventStatus = async (req, res) => {
  const { status } = req.body; // Get the new status from the request body
  const eventId = req.params.id; // Get the event ID from the route parameters

  try {
    // Validate the incoming status
    if (!['active', 'cancelled'].includes(status)) {
      return res.status(400).json({ // Handle invalid status
        success: false,
        message: 'Invalid status value',
      });
    }

    // Find and update the event status
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { new: true } // Return the updated document
    );

    // Check if the event was found
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Send back the updated event
    res.status(200).json({
      success: true,
      message: 'Event status updated successfully!',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event status',
      error: error.message,
    });
  }
};
