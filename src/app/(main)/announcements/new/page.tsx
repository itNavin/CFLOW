// "use client";

// import React, { useState, useEffect } from "react";
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";
// import { X, Clock } from "lucide-react";
// import { createAnnouncementByCourseIdAPI } from "@/api/announcement/createAnnouncementByCourseId";
// import { FileUpload } from "@/components/uploadFile";
// import { uploadAnnouncementFileAPI } from "@/api/storage/uploadAnnouncementFile";
// import type { uploadCourseFile } from "@/types/api/storage";

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   courseId: string;
// };

// export default function CreateAnnouncementModal({ open, onClose, courseId }: Props) {
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [time, setTime] = useState("09:00");
//   const [description, setDescription] = useState("");
//   const [title, setTitle] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [isScheduled, setIsScheduled] = useState(false);

//   if (!open) return null;

//   const handleFilesChange = (files: File[]) => setSelectedFiles(files);

//   const getScheduledDateTime = (): Date => {
//     if (!date) return new Date();
//     const [h, m] = time.split(":").map(Number);
//     const scheduledDate = new Date(date);
//     scheduledDate.setHours(h, m, 0, 0);
//     return scheduledDate;
//   };

//   const generateTimeOptions = () => {
//     const opts = [];
//     for (let h = 0; h < 24; h++) {
//       for (let m = 0; m < 60; m += 15) {
//         const val = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
//         const label = new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", {
//           hour: "numeric",
//           minute: "2-digit",
//           hour12: true,
//         });
//         opts.push({ value: val, label });
//       }
//     }
//     return opts;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const scheduleDate = isScheduled ? getScheduledDateTime().toISOString() : null;

//       const res = await createAnnouncementByCourseIdAPI(
//         courseId,
//         title.trim(),
//         description.trim(),
//         scheduleDate
//       );

//       const announcementId = res.data?.announcement?.id;
//       if (!announcementId) throw new Error("Missing announcementId");

//       if (selectedFiles.length > 0) {
//         await uploadAnnouncementFileAPI(courseId, announcementId, selectedFiles);
//       }

//       onClose(); // close after successful creation
//     } catch (err: any) {
//       setError(err?.response?.data?.message || err.message || "Failed to create announcement");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const canSubmit =
//     title.trim() && description.trim() && courseId && (!isScheduled || (date && time)) && !isSubmitting;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//       <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-6 font-dbheavent relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         <h2 className="text-xl font-semibold mb-4 text-[#0a1c30]">
//           Create New Announcement
//         </h2>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {error}
//           </div>
//         )}

//         <form className="space-y-6" onSubmit={handleSubmit}>
//           {/* Title */}
//           <div>
//             <label className="block font-medium mb-1">
//               Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#326295]"
//               placeholder="Enter announcement title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               disabled={isSubmitting}
//               required
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block font-medium mb-1">
//               Description <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#326295]"
//               placeholder="Enter announcement description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               disabled={isSubmitting}
//               required
//             />
//           </div>

//           {/* File Upload */}
//           <div>
//             <label className="block font-medium mb-1">Attach Files (Optional)</label>
//             <FileUpload
//               onFilesChange={handleFilesChange}
//               maxFiles={5}
//               maxFileSize={10}
//               disabled={isSubmitting}
//             />
//           </div>

//           {/* Schedule Section */}
//           <div>
//             <label className="block font-medium mb-3">Post Timing</label>
//             <div className="flex items-center space-x-4 mb-4">
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="postTiming"
//                   checked={!isScheduled}
//                   onChange={() => setIsScheduled(false)}
//                   className="mr-2"
//                 />
//                 Post Immediately
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="postTiming"
//                   checked={isScheduled}
//                   onChange={() => setIsScheduled(true)}
//                   className="mr-2"
//                 />
//                 Schedule for Later
//               </label>
//             </div>

//             {isScheduled && (
//               <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block font-medium mb-2">Select Date</label>
//                     <DayPicker
//                       mode="single"
//                       selected={date}
//                       onSelect={setDate}
//                       className="border rounded bg-white shadow-sm"
//                       fromDate={new Date()}
//                     />
//                   </div>

//                   <div>
//                     <label className="block font-medium mb-2">Select Time</label>
//                     <div className="flex items-center space-x-2">
//                       <Clock className="w-5 h-5 text-gray-500" />
//                       <select
//                         value={time}
//                         onChange={(e) => setTime(e.target.value)}
//                         className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#326295] bg-white"
//                       >
//                         {generateTimeOptions().map((opt) => (
//                           <option key={opt.value} value={opt.value}>
//                             {opt.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end space-x-3 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={!canSubmit}
//               className="px-6 py-2 rounded bg-gradient-to-r from-[#326295] to-[#0a1c30] text-white shadow hover:opacity-90 disabled:opacity-50"
//             >
//               {isSubmitting
//                 ? "Creating..."
//                 : isScheduled
//                 ? "Schedule"
//                 : "Post Now"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
