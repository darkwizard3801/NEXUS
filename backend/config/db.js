const mongoose = require("mongoose")


async function connectDB(){
    try{
        // Add connection options for better reliability
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            family: 4
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

    }catch(err){
        console.error('MongoDB connection error:', err);
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
}


module.exports = connectDB