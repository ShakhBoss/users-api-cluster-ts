import { users } from "../db/users.db";
import { User } from "../models/user.model";
import { v4 as uuidv4 } from "uuid";

export const getAllUsers = (): User[] => users;

export const getUserById = (id: string): User | undefined =>
  users.find((user) => user.id === id);

export const createUser = (user: Omit<User, "id">): User => {
  const newUser: User = { id: uuidv4(), ...user };
  users.push(newUser);
  return newUser;
};

export const updateUser = (
  id: string,
  updatedData: Omit<User, "id">
): User | null => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  users[index] = { id, ...updatedData };
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};
