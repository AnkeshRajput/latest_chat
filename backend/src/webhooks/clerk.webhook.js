import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!signingSecret) {
      res.status(503).json({ message: "Webhook secret is not provided" });
      return;
    }

    // clerk's verifier expects a Web Request with the raw body; express.raw gives a Buffer.
    console.log("Clerk webhook incoming headers:", req.headers);
    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);
    console.log("Clerk webhook payload length:", payload?.length);
    if (payload && payload.length > 0)
      console.log("Clerk webhook payload sample:", payload.slice(0, 100));

    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    // throws if the signature is wrong or the body was tampered with; only then do we trust evt.
    console.log("Using signing secret present:", Boolean(signingSecret));
    const evt = await verifyWebhook(request, { signingSecret });
    console.log("Clerk webhook verified event type:", evt?.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0] ||
        "User";

      try {
        const result = await User.findOneAndUpdate(
          { clerkId: u.id },
          {
            $set: {
              clerkId: u.id,
              email,
              fullName,
              profilePic: u.image_url ?? "",
              password: "",
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
        console.log("Clerk webhook - upserted/updated user:", result);
      } catch (mongoErr) {
        console.error("Clerk webhook - failed to upsert user:", mongoErr);
        throw mongoErr;
      }
    }

    if (evt.type === "user.deleted") {
      if (evt.data.id) {
        const del = await User.findOneAndDelete({ clerkId: evt.data.id });
        console.log("Clerk webhook - deleted user:", del);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error in Clerk webhook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }
});

export default router;
