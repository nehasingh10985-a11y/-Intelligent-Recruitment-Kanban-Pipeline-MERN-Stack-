const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connection check
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Checking Admin status...");

    // 2. Check if admin exists (Role aur Email dono se verify karna safer hai)
    const adminExists = await User.findOne({
      $or: [{ email: "admin@veridia.com" }, { role: "admin" }],
    });

    if (adminExists) {
      console.log("✅ Admin already exists. No action needed.");
    } else {
      // 3. Create New Admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt); // Stronger default password

      const adminUser = new User({
        name: "Super Admin",
        email: "admin@veridia.com",
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log(
        "🚀 Success: Admin Created! (Email: admin@veridia.com, Pass: admin123)",
      );
    }

    // 4. Properly close connection (Don't just kill the process)
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
};

seedAdmin();
