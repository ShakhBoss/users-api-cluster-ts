import { validate as isValidUUID } from "uuid";

export const validateUUID = (id: string): boolean => {
  return isValidUUID(id);
};
