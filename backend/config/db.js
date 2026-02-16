const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    console.log("MONGO_URI found:", process.env.MONGO_URI ? "Yes" : "No");

    // 1. Connection options ki zaroorat ab modern Mongoose mein nahi hoti (defaults are good)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // 2. Clearer logging (kaunsa host connect hua hai)
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // 3. Process exit with failure
    process.exit(1);
  }
};

// 4. Connection events handle karna (Optional par professional)
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB Disconnected!");
});

module.exports = connectDB;
