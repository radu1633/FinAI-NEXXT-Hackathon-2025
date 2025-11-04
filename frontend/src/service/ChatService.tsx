import axios from "axios";

export const postResponse = async (message: string) => {
  try {
    const response = await axios.post(`http://localhost:8090/chat`, {
      message,
    });
    return response.data.response; // FastAPI returns { response: "..." }
  } catch (error) {
    console.error("❌ Error sending message to AI:", error);
    throw new Error("Failed to fetch AI response");
  }
};
