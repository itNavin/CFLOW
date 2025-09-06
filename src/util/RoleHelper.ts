import { getUserRole } from "./cookies";

export const isCanUpload = () => {
  const role = getUserRole();
  return role === "ADMIN" || role === "ADVISOR" || role === "SUPER_ADMIN";
};

