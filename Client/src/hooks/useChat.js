import { useState, useCallback } from "react";
import { getMessages, sendMessage } from "../utils/api";

export function useChat(userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const sendMsg = useCallback(
    async (content) => {
      try {
        const message = await sendMessage(userId, content);
        setMessages((prev) => [...prev, message]);
        return message;
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [userId]
  );

  return { messages, loading, fetchMessages, sendMsg };
}
