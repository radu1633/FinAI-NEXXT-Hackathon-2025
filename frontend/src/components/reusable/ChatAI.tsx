import { useEffect, useState, useRef } from "react";
import { Send, Bot } from "lucide-react";
import SplineScene from "./SplineScene";
import { useChatAI } from "../../hooks/useChatAI";
import { useSelectedUser } from "../../Context/SelectedUserContext";

const apiKey = "";

// 🎧 Funcție TTS (Text to Speech)
async function tts(text: string, index: number, setPlayingIndex: Function) {
  try {
    setPlayingIndex(index);
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
      }),
    });

    if (!response.ok) throw new Error("Failed to generate audio");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => setPlayingIndex(null);
    audio.onerror = () => setPlayingIndex(null);

    await audio.play();
  } catch (err) {
    console.error("TTS error:", err);
    setPlayingIndex(null);
  }
}

// 🎤 Variabile globale pentru microfon
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: BlobPart[] = [];

// 🔁 Speech-to-Text (toggle)
async function speechToTextToggle(
  recording: boolean,
  setRecording: Function,
  handleSend: Function
) {
  try {
    if (!recording) {
      // 🔊 start record
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
        audioBitsPerSecond: 128000,
      });
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.start();
      setRecording(true);
      console.log("🎙️ Recording started...");
    } else {
      // ⏹️ stop record
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        setRecording(false);
        console.log("🛑 Recording stopped.");

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", audioBlob, "voice.webm");
          formData.append("model", "whisper-1");
          formData.append("language", "en");

          try {
            const response = await fetch(
              "https://api.openai.com/v1/audio/transcriptions",
              {
                method: "POST",
                headers: { Authorization: `Bearer ${apiKey}` },
                body: formData,
              }
            );

            const data = await response.json();
            console.log("🗣️ Transcribed:", data.text);
            if (data.text) handleSend(data.text);
          } catch (error) {
            console.error("Transcription error:", error);
          } finally {
            mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
          }
        };
      }
    }
  } catch (error) {
    console.error("🎤 Microphone error:", error);
    setRecording(false);
  }
}

// 🔹 Formatare text AI (bold, liste, emoji, etc)
function formatAIResponse(text: string) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");

  return lines
    .map((line) => {
      // Bold cu **text**
      const bold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Italic cu *text*
      const italic = bold.replace(/\*(.*?)\*/g, "<em>$1</em>");

      // Liste cu "- " sau "• "
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return `<li>${italic.slice(2).trim()}</li>`;
      }

      // Headings cu emoji (🎯, 📈, 💡 etc)
      if (/^[🎯💡📈📊🚀⭐✅❌🔥]/.test(line.trim())) {
        return `<h4 style="color:#fbe304;font-weight:700;margin-top:0.6rem;">${italic}</h4>`;
      }

      // Paragrafe normale
      return `<p style="margin-bottom:0.4rem;">${italic}</p>`;
    })
    .join("");
}

export function ChatAI() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const { sendMessage, loading, error } = useChatAI();
  const [recording, setRecording] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const { selectedUser } = useSelectedUser();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Intro fade-in
  useEffect(() => {
    const t1 = setTimeout(() => setIntroFading(true), 3000);
    const t2 = setTimeout(() => setShowIntroOverlay(false), 3600);
    const t3 = setTimeout(() => {
      setMessages([
        { from: "ai", text: "Hello! 👋 How can I help you today?" },
      ]);
    }, 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // scroll bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // handle send + user context
  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;

    setMessages((prev) => [...prev, { from: "user", text: value }]);
    setInput("");

    try {
      if (!selectedUser) {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "⚠️ Please select a client first." },
        ]);
        return;
      }

      const aiResponse = await sendMessage(value);

      if (aiResponse)
        setMessages((prev) => [...prev, { from: "ai", text: aiResponse }]);
      else
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "I couldn’t process your request right now." },
        ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "There was an error connecting to FinAI." },
      ]);
    }
  };

  const quickReplies = [
    "Arată-mi portofoliul",
    "Recomandări azi",
    "Prognoză piață",
  ];

  return (
    <div className="relative h-full w-full lg:w-1/3 flex flex-col bg-[#3b3c44] text-white rounded-none lg:rounded-3xl shadow-xl border-2 border-[#fbe304] p-4 overflow-visible">
      {/* Intro animation */}
      {showIntroOverlay && window.innerWidth > 0 && (
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-500 ${
            introFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="h-[90%] w-[100%] flex items-center justify-center">
            <div className="h-full w-full pl-32 max-w-[700px]">
              <SplineScene />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 border-b border-[#6c6e74] pb-3">
        <div className="bg-[#fbe304] p-2 rounded-lg">
          <Bot className="text-[#3b3c44]" size={22} />
        </div>
        <h2 className="text-xl font-bold text-[#fbe304]">
          <span className="text-white">Fin</span>AI{" "}
          <span className="text-white">Chat</span>
        </h2>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === "user" ? "justify-end" : "justify-start"
            } items-start gap-2`}
          >
            <div
              className={`relative max-w-[80%] px-6 py-2 rounded-2xl text-sm ai-message ${
                msg.from === "user"
                  ? "bg-[#fbe304] text-[#3b3c44] rounded-br-none"
                  : "bg-[#6c6e74] text-white rounded-bl-none"
              }`}
              dangerouslySetInnerHTML={{
                __html:
                  msg.from === "ai"
                    ? formatAIResponse(msg.text)
                    : msg.text.replace(/\n/g, "<br/>"),
              }}
            />

            {/* 🔊 TTS for AI messages */}
            {msg.from === "ai" && (
              <button
                onClick={() => tts(msg.text, index, setPlayingIndex)}
                className={`p-1.5 mt-1 rounded-full transition-all ${
                  playingIndex === index
                    ? "bg-[#fbe304]/20 shadow-[0_0_10px_rgba(251,227,4,0.7)] scale-110"
                    : "hover:bg-[#555]"
                }`}
              >
                {playingIndex === index ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="#fbe304"
                    className="w-4 h-4 animate-pulse"
                  >
                    <path d="M3 10a1 1 0 011-1h1v2H4a1 1 0 01-1-1zm3-3a1 1 0 011-1h1v8H7a1 1 0 01-1-1V7zm3-2a1 1 0 011-1h1v12h-1a1 1 0 01-1-1V5zm3 2a1 1 0 011-1h1v8h-1a1 1 0 01-1-1V7zm3 3a1 1 0 011-1h1v2h-1a1 1 0 01-1-1z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-[#fbe304]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5l6 7-6 7V5z"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 text-sm text-center italic">
            AI is thinking...
          </div>
        )}
        {error && (
          <div className="text-red-400 text-sm text-center">⚠️ {error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies + bot */}
      {!showIntroOverlay && (
        <div className="h-1/4 mb-3.5 ml-2 relative overflow-visible">
          <div className="flex items-center justify-between gap-3 overflow-visible">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto scrollbar-none">
                {quickReplies.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 text-sm rounded-full bg-[#6c6e74] hover:bg-[#7a7c83] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <SplineScene />
          </div>
        </div>
      )}

      {/* Input + mic + send */}
      <div className="flex items-center gap-3 z-[50]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Scrie un mesaj sau vorbește..."
          className="flex-1 px-4 py-2 rounded-2xl bg-[#6c6e74] text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fbe304]"
        />

        {/* 🎤 Microfon */}
        {/* 🎤 Microfon */}
        <button
          onClick={() =>
            speechToTextToggle(recording, setRecording, handleSend)
          }
          disabled={loading}
          className={`rounded-full p-3 transition-all flex items-center justify-center ${
            recording
              ? "bg-[#fbe304] text-[#3b3c44] animate-pulse shadow-[0_0_10px_rgba(251,227,4,0.7)] scale-110"
              : "bg-[#6c6e74] hover:bg-[#7a7c83] text-[#fbe304]"
          }`}
          title={recording ? "Oprește înregistrarea" : "Vorbește cu FinAI"}
        >
          {recording ? (
            // 🔴 Icon pătrat (în timpul înregistrării)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#3b3c44"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <rect x="8" y="8" width="8" height="8" rx="2" />
            </svg>
          ) : (
            // 🎤 Icon clasic de microfon (înainte de înregistrare)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 1v11m0 0a4 4 0 004-4V5a4 4 0 10-8 0v3a4 4 0 004 4zm0 0v8m-4 0h8"
              />
            </svg>
          )}
        </button>

        {/* 🚀 Send */}
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="bg-[#fbe304] text-[#3b3c44] rounded-2xl p-3 hover:bg-[#f8eb4c] transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
