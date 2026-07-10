import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";

export async function connectDB() {
  try {
    // Use reliable public DNS servers for SRV record resolution (fixes ECONNREFUSED on some networks)
    try {
      dns.setServers(["1.1.1.1", "1.0.0.1"]);
    } catch (dnsErr) {
      // ignore if setting DNS servers is not permitted in the environment
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in the environment variables.");
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected to", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
