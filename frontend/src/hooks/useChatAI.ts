import { useState } from "react";
import { postResponse } from "../service/ChatService";

export const useChatAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      const aiResponse = await postResponse(message);
      return aiResponse;
    } catch (err) {
      setError("Something went wrong while talking to AI.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};
