import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let user = await User.findOne({ clerkId: userId });

    // If the user profile isn't synced to our DB yet, try to fetch it from Clerk
    // using the secret key and upsert it into the users collection. This makes
    // the app resilient when webhooks are not configured or delayed.
    if (!user) {
      const clerkSecret = process.env.CLERK_SECRET_KEY;
      if (clerkSecret) {
        try {
          const resp = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: { Authorization: `Bearer ${clerkSecret}` },
          });

          if (resp.ok) {
            const u = await resp.json();

            const email =
              u.email_addresses?.find(
                (e) => e.id === u.primary_email_address_id,
              )?.email_address ?? u.email_addresses?.[0]?.email_address;

            const fullName =
              [u.first_name, u.last_name].filter(Boolean).join(" ") ||
              u.username ||
              email?.split("@")[0] ||
              "User";

            user = await User.findOneAndUpdate(
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
          }
        } catch (err) {
          console.error("Error fetching user from Clerk:", err);
        }
      }
    }

    if (!user) {
      res.status(404).json({ message: "User profile is not synced yet" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
