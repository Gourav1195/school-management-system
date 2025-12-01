// pages/feedback.tsx
"use client";
import { useEffect, useState } from "react";
import useSocket from "../../hooks/useSocket";

export default function Chat() {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) return;

    const handler = (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", handler);

    return () => {
      socket.off("chat message", handler);
    };
  }, [socket]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      // Show my own message instantly
      setMessages((prev) => [...prev, `Me: ${input}`]);

      socket.emit("chat message", input);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>
        Chat {connected ? "🟢" : "🔴"}
      </h2>

      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type..."
        style={{ marginRight: "0.5rem" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
