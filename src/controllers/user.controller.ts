import { IncomingMessage, ServerResponse } from "http";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service";
import { sendJson } from "../utils/response";
import { validateUUID } from "../utils/validate";
import { BodyMixin } from "undici-types";

export const userController = async (
  req: IncomingMessage,
  res: ServerResponse,
  id?: string
) => {
  const method = req.method;

  if (method === "GET" && !id) {
    const users = getAllUsers();
    return sendJson(res, 200, users);
  }

  if (method === "GET" && id) {
    if (!validateUUID(id))
      return sendJson(res, 400, { message: "Invalid UUID" });
    const user = getUserById(id);
    if (!user) return sendJson(res, 404, { message: "User not found" });
    return sendJson(res, 200, user);
  }

  if (method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, age, hobbies } = JSON.parse(body);
        if (!username || !age || !Array.isArray(hobbies)) {
          return sendJson(res, 400, { message: "Missing requied fields" });
        }
        const newUser = createUser({ username, age, hobbies });
        return sendJson(res, 201, newUser);
      } catch (error) {
        return sendJson(res, 400, { message: "Invalid JSON" });
      }
    });
  }

  if (method === "PUT" && id) {
    if (!validateUUID(id))
      return sendJson(res, 400, { message: "Invalid UUID" });
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { username, age, hobbies } = JSON.parse(body);
        if (!username || !age || !Array.isArray(hobbies)) {
          return sendJson(res, 400, { message: "Missing requied fields" });
        }
        const updated = updateUser(id, { username, age, hobbies });
        if (!updated) return sendJson(res, 404, { message: "User not found" });
        return sendJson(res, 200, updated);
      } catch (error) {
        return sendJson(res, 400, { message: "Invalid JSON" });
      }
    });
  }

  if (method === "DELETE" && id) {
    if (!validateUUID(id))
      return sendJson(res, 400, { message: "Invalid UUID" });
    const deleteOne = deleteUser(id);
    if (!deleteOne) return sendJson(res, 404, { message: "User not Found" });
    res.writeHead(204);
    res.end();
  }
};
