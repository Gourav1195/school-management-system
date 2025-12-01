// import express from "express";
// import next from "next";
// import { createServer } from "http";
// import { Server } from "socket.io";

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const expressApp = express();
//   const httpServer = createServer(expressApp);

//   const io = new Server(httpServer);

//   io.on("connection", (socket) => {
//     console.log("🟢 Client connected:", socket.id);

//     socket.on("chat message", (msg) => {
//       console.log("📩", msg);
//       io.emit("chat message", `Server: ${msg}`);
//     });

//     socket.on("disconnect", () => {
//       console.log("🔴 Client disconnected:", socket.id);
//     });
//   });

//   expressApp.all("*", (req: express.Request, res: express.Response) => handle(req, res));

//   httpServer.listen(3000, () => {
//     console.log("> Ready on http://localhost:3000");
//   });
// });
