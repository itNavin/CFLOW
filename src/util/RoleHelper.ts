import { getUserRole } from "./cookies";

export const isCanUpload = () => {
  const role = getUserRole();
  return role === "staff" || role === "lecturer" || role === "SUPER_ADMIN";
};

