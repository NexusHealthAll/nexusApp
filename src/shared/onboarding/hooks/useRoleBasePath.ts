import { useLocation } from "react-router-dom";

export function useRoleBasePath(): string {
  const location = useLocation();
  const [baseSegment] = location.pathname.split("/").filter(Boolean);
  return baseSegment ? `/${baseSegment}` : "/hospital";
}
