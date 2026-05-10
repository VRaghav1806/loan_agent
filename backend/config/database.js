const mongoose = require('mongoose');

// Cache the database connection across serverless function calls
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    return;
  }

  // Set global options
  mongoose.set('bufferCommands', false); // Disable buffering to fail fast if not connected

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`MongoDB connection error: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;

