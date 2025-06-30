// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
