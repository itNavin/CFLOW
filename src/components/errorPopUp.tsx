import React from "react";

type ErrorPopUpProps = {
  message: string;
  onClose: () => void;
};

export default function ErrorPopUp({ message, onClose }: ErrorPopUpProps) {
  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-50 bg-red-100 border border-red-400 px-4 py-3 rounded shadow-lg flex items-center space-x-3">
      <span>{message}</span>
      <button
        className="ml-4 px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}