// src/pages/api/socket.ts
import { Server } from "socket.io";

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    console.log("🚀 Starting Socket.IO server...");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("chat message", (msg) => {
        console.log("📩 Received:", msg);
        socket.emit("chat message", `You said: ${msg}`);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("⚡ Socket.IO server already running");
  }

  res.end();
}
