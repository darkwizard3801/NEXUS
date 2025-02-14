exports.suggestPackages = async (req, res) => {
    const { eventType, budget, guests, occasion } = req.body;

    try {
        // Call your machine learning model here to get package suggestions
        const packages = await getSuggestedPackages(eventType, budget, guests, occasion);
        
        res.status(200).json({
            success: true,
            packages,
        });
    } catch (error) {
        console.error('Error suggesting packages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to suggest packages',
        });
    }
}; 