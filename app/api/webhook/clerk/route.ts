import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import {
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/actions/userServerActions";
import { sendWelcomeEmail, sendAdminNewOrder } from "@/lib/email";
import { emailConfig } from "@/lib/email/resend";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    if (!id || !email_addresses) {
      return new Response("Error occurred -- missing data", {
        status: 400,
      });
    }

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username || "",
      firstName: first_name || "",
      lastName: last_name || "",
      photo: image_url || "",
    };

    await createUser(user);

    // Send welcome email with 5% discount code
    try {
      await sendWelcomeEmail(user.email, {
        firstName: user.firstName || "there",
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the webhook if email fails
    }

    // Send admin notification about new user signup
    try {
      await sendAdminNewOrder(emailConfig.adminEmail, {
        userName:
          `${user.firstName} ${user.lastName}`.trim() ||
          user.username ||
          "New User",
        userEmail: user.email,
        signupDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't fail the webhook if admin email fails
    }
  }

  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    if (!id) {
      return new Response("Error occurred -- missing id", {
        status: 400,
      });
    }

    const user = {
      firstName: first_name || "",
      lastName: last_name || "",
      username: username || "",
      photo: image_url || "",
    };

    await updateUser(id, user);
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("Error occurred -- missing id", {
        status: 400,
      });
    }

    await deleteUser(id);
  }

  return new Response("", { status: 200 });
}
