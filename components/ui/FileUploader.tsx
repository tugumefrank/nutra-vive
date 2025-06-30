"use client";

import { useCallback, Dispatch, SetStateAction, useState } from "react";
import { useDropzone } from "@uploadthing/react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Upload,
  Loader2,
  X,
  Music,
  Video,
  Image as ImageIcon,
} from "lucide-react";

// Helper function to convert file to URL
export function convertFileToUrl(file: File): string {
  return URL.createObjectURL(file);
}

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  imageUrl: string;
  setFiles: Dispatch<SetStateAction<File[]>>;
  uploading: boolean;
  uploadProgress?: number;
  accept?: string; // Optional prop to specify accepted file types
};

export function FileUploader({
  imageUrl,
  onFieldChange,
  setFiles,
  uploading,
  uploadProgress = 0,
  accept = "image/*",
}: FileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (uploading) return; // Prevent new uploads while one is in progress

      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles);
        const localUrl = convertFileToUrl(acceptedFiles[0]);
        setPreviewUrl(localUrl);
        onFieldChange(localUrl); // This will be overwritten when server upload completes
      }
    },
    [onFieldChange, setFiles, uploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept([accept]),
    maxFiles: 1,
    disabled: uploading,
  });

  // Determine what icon to show based on the accept type
  const getIcon = () => {
    if (accept.includes("audio"))
      return <Music className="w-16 h-16 text-amber-500/70" />;
    if (accept.includes("video"))
      return <Video className="w-16 h-16 text-purple-500/70" />;
    return <ImageIcon className="w-16 h-16 text-emerald-500/70" />;
  };

  // Determine media type name
  const getMediaTypeName = () => {
    if (accept.includes("audio")) return "audio file";
    if (accept.includes("video")) return "video";
    return "image";
  };

  // Determine accepted file format text
  const getFileFormatText = () => {
    if (accept.includes("audio")) return "MP3, WAV, M4A (Max 100MB)";
    if (accept.includes("video")) return "MP4, WebM, MOV (Max 500MB)";
    return "PNG, JPG, WebP (Max 4MB)";
  };

  // Determines if we should show the final uploaded content or a local preview
  const displayUrl = imageUrl || previewUrl;

  return (
    <div
      {...getRootProps()}
      className={`flex items-center justify-center w-full h-72 rounded-xl border-2 border-dashed transition-colors ${
        isDragActive
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-gray-700 bg-gray-800/50"
      } ${
        uploading
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-emerald-500/50"
      }`}
    >
      <input
        {...getInputProps()}
        className="cursor-pointer"
        disabled={uploading}
      />

      {displayUrl ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {accept.includes("audio") ? (
            <div className="flex flex-col items-center justify-center w-[90%] h-full p-6">
              <Music className="h-12 w-12 text-amber-500 mb-4" />
              <audio src={displayUrl} controls className="w-full mb-2" />
              {!uploading && (
                <p className="text-gray-400 text-sm mt-2">
                  Click to replace audio file
                </p>
              )}
            </div>
          ) : accept.includes("video") ? (
            <div className="w-full h-full">
              <video
                src={displayUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={displayUrl}
                alt="Uploaded file"
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}

          {/* Overlay that shows during upload or on hover */}
          {!uploading ? (
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white bg-black/60 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Click to replace</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-3" />
              <p className="text-white font-medium mb-2">
                Uploading {getMediaTypeName()}...
              </p>

              {/* Progress bar */}
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-white/70 text-sm mt-2">
                {uploadProgress}% complete
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-5 text-center px-6">
          {getIcon()}

          <h3 className="mt-4 text-lg font-medium text-white">
            {isDragActive
              ? `Drop your ${getMediaTypeName()} here`
              : `Drag and drop your ${getMediaTypeName()}`}
          </h3>

          <p className="mt-2 text-sm text-gray-400 mb-6">
            {getFileFormatText()}
          </p>

          <Button
            type="button"
            className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
}

// Specialized uploaders
export function ImageUploader(props: Omit<FileUploaderProps, "accept">) {
  return <FileUploader {...props} accept="image/*" />;
}

export function AudioUploader(props: Omit<FileUploaderProps, "accept">) {
  return <FileUploader {...props} accept="audio/*" />;
}

export function VideoUploader(props: Omit<FileUploaderProps, "accept">) {
  return <FileUploader {...props} accept="video/*" />;
}

// Profile image uploader is special with circular design
export function ProfileImageUploader({
  imageUrl,
  onFieldChange,
  setFiles,
  uploading,
  uploadProgress = 0,
}: FileUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (uploading) return; // Prevent new uploads while one is in progress

      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles);
        const localUrl = convertFileToUrl(acceptedFiles[0]);
        setPreviewUrl(localUrl);
        onFieldChange(localUrl);
      }
    },
    [onFieldChange, setFiles, uploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(["image/*"]),
    maxFiles: 1,
    disabled: uploading,
  });

  // Determines if we should show the final uploaded content or a local preview
  const displayUrl = imageUrl || previewUrl || "/images/default-avatar.jpg";

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`relative h-32 w-32 rounded-full overflow-hidden 
          ${
            isDragActive
              ? "ring-4 ring-emerald-500"
              : "ring-2 ring-emerald-500/50"
          } 
          ${
            uploading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:ring-emerald-500"
          }
        `}
      >
        <input
          {...getInputProps()}
          className="cursor-pointer"
          disabled={uploading}
        />

        <Image
          src={displayUrl}
          alt="Author Preview"
          fill
          className="object-cover"
        />

        {!uploading ? (
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="h-6 w-6 text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin mb-1" />
            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mt-3">
        {uploading ? "Uploading..." : "Click to upload profile photo"}
      </p>
    </div>
  );
}
