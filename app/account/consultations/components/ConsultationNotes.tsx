"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Bell,
  BellOff,
  Clock,
  User,
  CheckCircle,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import {
  getUserConsultationNotes,
  markConsultationNoteAsRead,
} from "@/lib/actions/consultation";
import { toast } from "sonner";

interface UserConsultationNote {
  _id: string;
  consultation: string;
  consultant: {
    firstName: string;
    lastName: string;
  };
  title: string;
  content: string;
  noteType: "nutrition" | "progress" | "recommendation" | "general";
  isVisible: boolean;
  readByUser: boolean;
  sentAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsultationNotesProps {
  consultationId: string;
  onNotesUpdate?: (unreadCount: number) => void;
}

const ConsultationNotes: React.FC<ConsultationNotesProps> = ({
  consultationId,
  onNotesUpdate,
}) => {
  const { userId } = useAuth();
  const [notes, setNotes] = useState<UserConsultationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    if (consultationId && userId) {
      loadNotes();
    }
  }, [consultationId, userId]);

  const loadNotes = async () => {
    if (!consultationId || !userId) return;

    setLoading(true);
    try {
      const notesData = await getUserConsultationNotes(consultationId, userId);
      // Map consultant string to object if necessary
      const mappedNotes = (notesData as any[]).map((note) => ({
        ...note,
        consultant:
          typeof note.consultant === "string"
            ? { firstName: note.consultant, lastName: "" }
            : note.consultant,
      }));
      setNotes(mappedNotes);

      // Notify parent component of unread count
      const unreadCount = mappedNotes.filter((note) => !note.readByUser).length;
      onNotesUpdate?.(unreadCount);
    } catch (error) {
      console.error("Error loading consultation notes:", error);
      toast.error("Failed to load consultation notes");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (noteId: string) => {
    if (!userId) return;

    setMarkingAsRead(noteId);
    try {
      const result = await markConsultationNoteAsRead(noteId, userId);
      if (result.success) {
        setNotes((prev) =>
          prev.map((note) =>
            note._id === noteId
              ? { ...note, readByUser: true, readAt: new Date().toISOString() }
              : note
          )
        );

        // Update unread count
        const unreadCount = notes.filter(
          (note) => note._id !== noteId && !note.readByUser
        ).length;
        onNotesUpdate?.(unreadCount);

        toast.success("Note marked as read");
      } else {
        toast.error(result.error || "Failed to mark note as read");
      }
    } catch (error) {
      console.error("Error marking note as read:", error);
      toast.error("Failed to mark note as read");
    } finally {
      setMarkingAsRead(null);
    }
  };

  const getNoteTypeColor = (noteType: string) => {
    switch (noteType) {
      case "nutrition":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700";
      case "progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
      case "recommendation":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700";
    }
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

  if (loading) {
    return (
      <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Consultation Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Loading notes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Messages from Your Consultant
          {notes.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {notes.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Messages Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your consultant will send you personalized notes and
              recommendations here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-l-4 transition-all ${
                  note.readByUser
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-l-gray-300 dark:border-l-gray-600"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 border-l-blue-500"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {note.title}
                    </h4>
                    <Badge
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getNoteTypeColor(
                        note.noteType
                      )}`}
                    >
                      {note.noteType}
                    </Badge>
                    {!note.readByUser && (
                      <div className="flex items-center gap-1">
                        <Bell className="w-3 h-3 text-blue-500" />
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full font-medium">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(note.sentAt)}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        From: {note.consultant.firstName}{" "}
                        {note.consultant.lastName}
                      </div>
                    </div>
                    {!note.readByUser && (
                      <Button
                        onClick={() => handleMarkAsRead(note._id)}
                        disabled={markingAsRead === note._id}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                      >
                        {markingAsRead === note._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark as Read
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {note.readAt && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Read on: {formatDate(note.readAt)}
                  </div>
                )}

                {!note.readByUser && (
                  <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <AlertCircle className="w-4 h-4" />
                      <span>This message requires your attention</span>
                    </div>
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

export default ConsultationNotes;
