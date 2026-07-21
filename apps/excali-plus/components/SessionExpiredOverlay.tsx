"use client";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setSessionExpiredDialogOpen } from "@/store/slices/uiSlice";
import AuthBox from "./AuthBox";

export default function SessionExpiredOverlay() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.isSessionExpiredDialogOpen);

  if (!open) return null;

  return (
    <div
      onClick={() => dispatch(setSessionExpiredDialogOpen(false))}
      className="fixed inset-0 z-50 bg-black/20 flex justify-center items-center"
    >
      <AuthBox
        title="Your session has expired. Please sign in again."
        handleClose={() => dispatch(setSessionExpiredDialogOpen(false))}
        onSuccess={() => dispatch(setSessionExpiredDialogOpen(false))}
      />
    </div>
  );
}
