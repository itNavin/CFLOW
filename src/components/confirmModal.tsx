"use client";
import React from "react";
import { createPortal } from "react-dom";

export type ConfirmProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  if (!open) return null;
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 z-50" />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-white shadow-xl border">
          <div className="p-6">
            <h3 className="text-2xl font-semibold">{title}</h3>
            {message && <p className="mt-2 text-lg text-gray-800">{message}</p>}
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button className="rounded px-4 py-2 cursor-pointer text-lg" onClick={onCancel} disabled={loading}>
              {cancelText}
            </button>
            <button
              className="rounded px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed text-lg"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Processing…" : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}