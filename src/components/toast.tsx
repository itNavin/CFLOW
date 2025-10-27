"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; 
};

type ToastContextValue = {
  showToast: (t: { title?: string; message: string; variant?: ToastVariant; duration?: number }) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return {
    showToast: (t) => {
      console.warn("[Toast] showToast called without ToastProvider:", t);
    },
    dismissToast: (id: string) => {
      console.warn("[Toast] dismissToast called without ToastProvider:", id);
    },
  };
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, variant: "info", duration: 5000, ...t };
    setToasts((prev) => [toast, ...prev]);
    if (toast.duration && toast.duration > 0) {
      window.setTimeout(() => remove(id), toast.duration);
    }
    return id;
  }, [remove]);

  const dismissToast = useCallback((id: string) => {
    remove(id);
  }, [remove]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} onClose={dismissToast} />
    </ToastContext.Provider>
  );
};

function ToastPortal({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div aria-live="polite" className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 max-w-md">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>,
    document.body
  );
}

function variantStyles(v?: ToastVariant) {
  switch (v) {
    case "success":
      return "bg-green-50 border-green-200 text-green-900";
    case "error":
      return "bg-red-50 border-red-200 text-red-900";
    case "warning":
      return "bg-yellow-50 border-yellow-200 text-yellow-900";
    case "info":
    default:
      return "bg-blue-50 border-blue-200 text-blue-900";
  }
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // enter animation
    const id = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      role="status"
      className={`transform transition-all duration-200 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"} ${variantStyles(
        toast.variant
      )} border rounded-xl shadow-md px-4 py-3`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {toast.title && <div className="font-semibold text-xl leading-tight">{toast.title}</div>}
          <div className="text-xl leading-tight">{toast.message}</div>
        </div>
        <button
          aria-label="Dismiss toast"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 150);
          }}
          className="p-1 rounded hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}