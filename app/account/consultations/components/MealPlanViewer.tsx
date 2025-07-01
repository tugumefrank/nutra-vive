"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import {
  getUserMealPlanFiles,
  downloadMealPlanFile,
} from "@/lib/actions/consultation";
import { toast } from "sonner";

interface MealPlanFile {
  _id: string;
  consultation: {
    consultationNumber: string;
  };
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
  title: string;
  description?: string;
  nutritionNotes?: string;
  downloadCount: number;
  isActive: boolean;
  expiresAt?: string;
  uploadedAt: string;
  lastDownloadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface MealPlanViewerProps {
  consultationId: string;
  onFilesUpdate?: (fileCount: number) => void;
}

const MealPlanViewer: React.FC<MealPlanViewerProps> = ({
  consultationId,
  onFilesUpdate,
}) => {
  const { userId } = useAuth();
  const [files, setFiles] = useState<MealPlanFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (consultationId && userId) {
      loadFiles();
    }
  }, [consultationId, userId]);

  const loadFiles = async () => {
    if (!consultationId || !userId) return;

    setLoading(true);
    try {
      const filesData = await getUserMealPlanFiles(userId, consultationId);
      // Map filesData to match MealPlanFile interface
      const mappedFiles = (filesData as any[]).map((file) => ({
        ...file,
        consultation:
          typeof file.consultation === "string"
            ? { consultationNumber: file.consultation }
            : file.consultation,
      }));
      setFiles(mappedFiles);

      // Notify parent component of file count
      onFilesUpdate?.(filesData.length);
    } catch (error) {
      console.error("Error loading meal plan files:", error);
      toast.error("Failed to load meal plan files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    if (!userId) return;

    setDownloading(fileId);
    try {
      const result = await downloadMealPlanFile(fileId, userId);
      if (result.success && result.fileUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = result.fileUrl;
        link.download = fileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update download count in local state
        setFiles((prev) =>
          prev.map((file) =>
            file._id === fileId
              ? {
                  ...file,
                  downloadCount: file.downloadCount + 1,
                  lastDownloadedAt: new Date().toISOString(),
                }
              : file
          )
        );

        toast.success("Download started successfully!");
      } else {
        toast.error(result.error || "Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "📊";
    return "📎";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            Meal Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              Loading meal plans...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          Your Meal Plans
          {files.length > 0 && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {files.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Meal Plans Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your personalized meal plans will appear here once uploaded by
              your consultant.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border transition-all hover:shadow-md ${
                  isExpired(file.expiresAt)
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl" role="img" aria-label="File type">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {file.title}
                        </h4>
                        {isExpired(file.expiresAt) && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {file.fileName} " {formatFileSize(file.fileSize)}
                      </p>
                      {file.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {file.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(file.uploadedAt)}
                        </div>
                        {file.downloadCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            Downloaded {file.downloadCount} time
                            {file.downloadCount !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() =>
                        handleDownloadFile(file._id, file.fileName)
                      }
                      disabled={
                        downloading === file._id || isExpired(file.expiresAt)
                      }
                      size="sm"
                      className={`${
                        isExpired(file.expiresAt)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {downloading === file._id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {downloading === file._id
                        ? "Downloading..."
                        : isExpired(file.expiresAt)
                          ? "Expired"
                          : "Download"}
                    </Button>
                    <Button
                      onClick={() => window.open(file.fileUrl, "_blank")}
                      variant="outline"
                      size="sm"
                      disabled={isExpired(file.expiresAt)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                {file.nutritionNotes && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Special Notes:
                        </span>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1 whitespace-pre-wrap">
                          {file.nutritionNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {file.expiresAt && !isExpired(file.expiresAt) && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Expires on: {formatDate(file.expiresAt)}</span>
                  </div>
                )}

                {file.lastDownloadedAt && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      Last downloaded: {formatDate(file.lastDownloadedAt)}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanViewer;
