import { io, type Socket } from "socket.io-client";
import { API_URL, getStoredToken } from "./api";

let socket: Socket | null = null;
let socketToken: string | null = null;

/**
 * Returns a shared authenticated Socket.io connection.
 * Recreates the connection when the stored JWT changes.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  const token = getStoredToken();
  if (!token) return null;
  if (socket && socketToken === token) return socket;

  socket?.disconnect();
  socketToken = token;
  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}
