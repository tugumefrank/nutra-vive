import { create } from "zustand";
import { NotificationStore, NotificationWithData } from "@/types";
import { generateId } from "@/lib/utils";

const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification: NotificationWithData = {
      ...notification,
      id: generateId(),
      isRead: false,
      createdAt: new Date(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));

    // Auto-remove notification after 5 seconds for non-persistent types
    if (!["order", "payment"].includes(notification.type)) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, 5000);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id
      ),
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

export default useNotificationStore;
