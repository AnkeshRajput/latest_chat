import { create } from "zustand";
import { persist } from "zustand/middleware";
//Added sound effect for incoming messages
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

function playIncomingMessageSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Sweet double-chime tone using Web Audio API
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.08); // E6
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.error("Audio chime playback failed:", e);
  }
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          // use public users endpoint which doesn't require the server-side auth cookie
          const res = await axiosInstance.get("/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser &&
              res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to load messages",
          );
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return false;

        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData,
          );
          set({ messages: [...messages, res.data], composerText: "" });
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to send message",
          );
          return false;
        }
      },

      subscribeToMessages: () => {},
      unsubscribeFromMessages: () => {},

      handleNewMessage: (newMessage) => {
        const { selectedUser, messages, isSoundEnabled } = get();

        // Deduplicate messages
        const exists = messages.some((m) => m._id === newMessage._id);
        if (exists) return;

        // Append message to chat screen if relevant to the current conversation
        if (
          selectedUser &&
          (String(newMessage.senderId) === String(selectedUser._id) ||
            String(newMessage.receiverId) === String(selectedUser._id))
        ) {
          set({ messages: [...messages, newMessage] });
        }

        // Always refresh sidebar list order and previews
        get().getConversations();

        // Play incoming notification chime if enabled and sent by someone else
        const currentUserId = useAuthStore.getState().authUser?._id;
        if (isSoundEnabled && String(newMessage.senderId) !== String(currentUserId)) {
          playIncomingMessageSound();
        }
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find(
              (user) => user._id === activeConversationId,
            ) ||
            null,
          messages: [], // Clear messages immediately on chat swap to prevent showing previous messages
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "imessage-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);
