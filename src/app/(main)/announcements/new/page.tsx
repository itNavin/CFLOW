"use client";

import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Make sure this is imported

export default function NewAnnouncement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [title, setTitle] = useState("");

  // Basic formatting handler
  const format = (command: string) => {
    document.execCommand(command, false);
  };

  return (
    <div className="flex min-h-screen font-dbheavent">
      <div className="flex-1 p-6 bg-white">
        <div className="text-xl font-semibold mb-6 flex items-center gap-3">
          <button className="text-lg">&larr;</button>
          Create New Announcement
        </div>

        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-base"
              placeholder="HelloHello"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>

            {/* Toolbar */}
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => format("bold")} className="px-2 py-1 border rounded">B</button>
              <button type="button" onClick={() => format("italic")} className="px-2 py-1 border rounded">I</button>
              <button type="button" onClick={() => format("insertUnorderedList")} className="px-2 py-1 border rounded">•</button>
            </div>

            {/* Rich Text Editor */}
            <div
              contentEditable
              className="w-full min-h-[150px] border border-gray-300 rounded px-3 py-2 focus:outline-none"
              onInput={(e) => setDescriptionHTML(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: descriptionHTML }}
            />
          </div>

          {/* Post Later */}
          <div>
            <label className="block font-medium mb-1">Post Later</label>
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded shadow mt-2"
            />
          </div>
        </form>

        {/* Post Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-[#326295] text-white px-6 py-2 rounded shadow hover:bg-[#28517c] transition"
            onClick={(e) => {
              e.preventDefault();
              console.log("Title:", title);
              console.log("Description:", descriptionHTML);
              console.log("Scheduled Date:", date);
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
