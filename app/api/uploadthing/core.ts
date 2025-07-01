// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/db/models";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // For devotion cover images
  coverImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      // You could authenticate users here
      return { userId: "user-id" }; // Will be available as metadata.userId
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Cover image upload complete for userId:", metadata.userId);
      console.log("Cover image URL:", file.url);

      return { url: file.url };
    }),
  // general image images
  imageUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { userId: "user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("image image upload complete for userId:", metadata.userId);
      console.log("image image URL:", file.url);

      return { url: file.url };
    }),
  // For author profile images
  authorImageUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { userId: "user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Author image upload complete for userId:", metadata.userId);
      console.log("Author image URL:", file.url);

      return { url: file.url };
    }),

  // For sermon/devotion audio
  audioUploader: f({
    audio: { maxFileSize: "1GB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { userId: "user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Audio upload complete for userId:", metadata.userId);
      console.log("Audio URL:", file.url);

      return { url: file.url };
    }),

  // For sermon/devotion video
  videoUploader: f({
    video: { maxFileSize: "1GB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { userId: "user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Video upload complete for userId:", metadata.userId);
      console.log("Video URL:", file.url);

      return { url: file.url };
    }),

  // For multiple images (galleries for events, etc.)
  multiImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      return { userId: "user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Multi-image upload complete for userId:", metadata.userId);
      console.log("Image URL:", file.url);

      return { url: file.url };
    }),

  // For meal plan file uploads (PDF, Word, etc.)
  mealPlanUploader: f({
    "application/pdf": { maxFileSize: "8MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "4MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
    "application/vnd.ms-excel": { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // Authenticate the user with Clerk
      const { userId } = await auth();

      if (!userId) {
        throw new Error("Unauthorized: User must be logged in");
      }

      // Connect to database and verify user is admin
      await connectToDatabase();
      const user = await User.findOne({ clerkId: userId });

      if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Only consultants can upload meal plans");
      }

      console.log("🔍 Meal plan upload middleware - User:", user._id);

      return {
        userId: user._id.toString(),
        consultantId: user._id.toString(),
        userRole: user.role,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Meal plan file upload complete:");
      console.log("- Consultant ID:", metadata.consultantId);
      console.log("- File URL:", file.url);
      console.log("- File Key:", file.key);
      console.log("- File Name:", file.name);
      console.log("- File Size:", file.size);
      console.log("- File Type:", file.type);

      // Return the file information for the client
      return {
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        uploadedBy: metadata.consultantId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
