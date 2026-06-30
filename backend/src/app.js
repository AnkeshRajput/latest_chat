import express from "express";
import "dotenv/config";

import { connectDB } from "./lib/db.js";
import User from "./models/user.model.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello i am Ankesh");
});

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`server is running on port ${PORT}`);
});
