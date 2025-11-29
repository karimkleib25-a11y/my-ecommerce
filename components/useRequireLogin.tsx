import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export function useRequireLogin() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();

  return (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthed) {
      toast.error("Please login to continue");
      navigate("/auth");
      return;
    }

    callback();
  };
}