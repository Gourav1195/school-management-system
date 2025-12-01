// hooks/useSocket.js
"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import type { Socket } from "socket.io-client";

let socket:Socket; // singleton

export default function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io({
        path: "/api/socket", // matches backend
      });
    }

    socket.on("connect", () => {
      setConnected(true);
      console.log("🟢 Connected to server");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("🔴 Disconnected from server");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection failed:", err.message);
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
      }
    };
  }, []);

  return { socket, connected };
}
