"use client";

import React, { useState } from "react";
import { Announcement } from "@/types/api/announcement";
import { updateAnnouncementAPI } from "@/api/announcement/updateAnnouncement";

type Props = {
    open: boolean;
    onClose: () => void;
    announcement: Announcement.Announcements;
    onSubmit: (data: { name: string; description: string }) => Promise<void>;
};

export default function EditAnnouncementModal({ open, onClose, announcement, onSubmit }: Props) {
    const [name, setName] = useState(announcement.name);
    const [description, setDescription] = useState(announcement.description);
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={onClose}
                    disabled={submitting}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Announcement</h2>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Title</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                        rows={5}
                        required
                    />
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                    <button
                        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                        onClick={async () => {
                            setSubmitting(true);
                            await onSubmit({ name, description });
                            setSubmitting(false);
                            onClose();
                        }}
                        disabled={submitting}
                    >
                        {submitting ? "Saving..." : "Save"}
                    </button>
                    <button
                        className="bg-gray-200 text-gray-700 px-5 py-2 rounded hover:bg-gray-300 transition"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}