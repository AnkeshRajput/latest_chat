import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "fs";
import path from "path";

import job from "./lib/cron.js";

import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import messageRoutes from "./routes/message.route.js";

import authRoutes from "./routes/auth.route.js";

import dns from "dns";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

import { app, server } from "./lib/socket.js";

const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

// it's important that you don't parse the webhook event data, it should be in the raw format
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook,
);

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(clerkMiddleware());

app.get("/hello", (req, res) => {
  res.send("Hello i am Ankesh");
});

app.use("/api/auth", authRoutes);
// Public: return a list of users (used by the UI sidebar). This endpoint intentionally
// does not require Clerk authentication so the client can populate the list quickly.
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-clerkId");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in public users endpoint:", error?.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.use("/api/messages", messageRoutes);

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    if (process.env.NODE_ENV === "production") job.start();
  });
};

startServer();
