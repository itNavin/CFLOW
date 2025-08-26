"use client";

import React, { useRef } from "react";
import { MoreHorizontal, Plus } from "lucide-react";

const files = [
  {
    name: "PDFfile.pdf",
    modified: "4/18/2025",
    modifiedBy: "Thanatat Wongabut",
  },
  {
    name: "PDFfileonetwothreefourfivesixseveneightnineteen.pdf",
    modified: "4/18/2025",
    modifiedBy: "Thanatat Wongabut",
  },
  {
    name: "222PDFfile222.pdf",
    modified: "4/21/2025",
    modifiedBy: "Thanatat Wongabut",
  },
  {
    name: "222fileonetwothreefourfivesixseveneightnineteneleven.pdf",
    modified: "4/21/2025",
    modifiedBy: "Thanatat Wongabut",
  },
];

export default function FilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click(); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      console.log("Selected files:", selectedFiles);
      // TODO: Handle actual upload logic here
    }
  };

  return (
    <main className="min-h-screen bg-white p-6 pb-28 font-dbheavent">
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full text-base">
          <thead>
            <tr className="text-left text-gray-600 border-b border-gray-300">
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Modified</th>
              <th className="py-3 px-4 font-semibold">Modified By</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-yellow-500">📁</span>
                  <span className="text-xl truncate max-w-[400px]">
                    {file.name}
                  </span>
                  <MoreHorizontal className="ml-auto w-4 h-4 text-gray-500 cursor-pointer" />
                </td>
                <td className="text-xl py-3 px-4 text-gray-700">
                  {file.modified}
                </td>
                <td className="text-xl py-3 px-4 text-gray-700">
                  {file.modifiedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* File Upload Input (hidden) */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Floating Upload Button */}
      <button
        onClick={handleUploadClick}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow
                 bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white text-[16px] font-medium
                 hover:from-[#28517c] hover:to-[#071320] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#326295]
                 active:scale-[0.98] transition"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Add New Files</span>
      </button>
    </main>
  );
}
