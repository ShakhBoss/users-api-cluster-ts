import { IncomingMessage, ServerResponse } from "http";
import { userController } from "../controllers/user.controller";

export const handleUserRoutes = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const url = req.url || "";
  const method = req.method || "";

  if (url === "/api/users" && ["GET", "POST"].includes(method)) {
    return userController(req, res);
  }
  const match = url.match(/^\/api\/users\/([0-9a-fA-F-]{36})$/);
  if (match) {
    const id = match[1];
    return userController(req, res, id);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
};
