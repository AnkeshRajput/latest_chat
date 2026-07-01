import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import path from "path";
import job from "./lib/cron.js";

import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhook from "./webhooks/clerk.webhook.js";


const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();
const publicdir = path.join(process.cwd(), 'public');

// it's important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL
, credentials: true
}));
app.use(clerkMiddleware());

app.get("/hello", (req, res) => {
  res.send("Hello i am Ankesh");
});

if(fs.existsSync(publicdir)){
  app.use(express.static(publicdir));


  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

const PORT = process.env.PORT;


app.listen(PORT, async () => {
  await connectDB();
  console.log(`server is running on port ${PORT}`);
  if (process.env.NODE_ENV === "production") job.start();
});
