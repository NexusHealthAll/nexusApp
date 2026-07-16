import { create } from "zustand";

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  /** Worker id in the directory, when the contact exists there. */
  workerId?: string;
  name: string;
  role: string;
  presence: string;
  lastTime: string;
  unread: boolean;
  currentShift?: string;
  rating?: number;
  completedShifts?: number;
  pinned?: string;
  messages: ChatMessage[];
}

/**
 * Conversation store for the Messages page. The backend exposes no
 * messaging endpoints yet, so this starts empty (the page shows an empty
 * state). Swap the initial state for a real chat service (REST/WebSocket)
 * once one exists; the UI only depends on these shapes.
 */
interface MessagesState {
  conversations: Conversation[];
  activeId: string;
  setActive: (id: string) => void;
  send: (conversationId: string, text: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: [],
  activeId: "",
  setActive: (id) =>
    set((state) => ({
      activeId: id,
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unread: false } : c,
      ),
    })),
  send: (conversationId, text) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastTime: "Now",
              messages: [
                ...c.messages,
                {
                  id: `m-${Date.now()}`,
                  fromMe: true,
                  text,
                  time: new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                },
              ],
            }
          : c,
      ),
    })),
}));
