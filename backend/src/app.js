import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from '@clerk/express'

const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();
app.use(express.json());
app.use(cors({
  origin: FRONTEND_URL
, credentials: true
}));
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Hello i am Ankesh");
});

const PORT = process.env.PORT;


app.listen(PORT, async () => {
  await connectDB();
  console.log(`server is running on port ${PORT}`);
});
