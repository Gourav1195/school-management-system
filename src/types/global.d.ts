// global.d.ts
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";

declare global {
  // Add fields to globalThis
  // (so TS stops screaming)
  var server: HttpServer | undefined;
  var io: IOServer | undefined;
}
