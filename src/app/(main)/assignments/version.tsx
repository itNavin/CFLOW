// "use client";

// import React from "react";

// type FileLink = { name: string; href: string };

// type FeedbackItem = {
//   chapter: string;                 // e.g., "Chapter 4"
//   title: string;                   // e.g., "System Design and Implementation"
//   comments: string[];              // bullet points
//   files?: FileLink[];              // optional attachments under the chapter list
// };

// type WorkItem = {
//   chapter: string;                 // e.g., "Chapter 4"
//   files: FileLink[];               // submitted files
// };

// type StatusVariant = "approved" | "not_approved" | "pending";

// type VersionProps = {
//   versionLabel: string;            // e.g., "Version 01"
//   statusText: string;              // e.g., "Not Approved"
//   statusVariant?: StatusVariant;   // controls color
//   feedback: FeedbackItem[];
//   workDescription: string;
//   work: WorkItem[];
//   className?: string;
// };

// /* ---------- Helper ---------- */
// const statusColor = (v: StatusVariant = "pending") => {
//   switch (v) {
//     case "approved":
//       return "text-green-600";
//     case "not_approved":
//       return "text-red-600";
//     default:
//       return "text-amber-600";
//   }
// };

// /* ---------- Component ---------- */
// export default function Version({
//   versionLabel,
//   statusText,
//   statusVariant = "not_approved",
//   feedback,
//   workDescription,
//   work,
//   className = "",
// }: VersionProps) {
//   return (
//     <div className={`font-dbheavent ${className}`}>
//       <div className="mb-3">
//         <h1 className="text-[18px] font-semibold text-[#e74c3c]">
//           {versionLabel}
//         </h1>
//         <p className={`mt-1 text-sm ${statusColor(statusVariant)}`}>
//           Status: {statusText}
//         </p>
//       </div>

//       <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
//         {/* Feedback */}
//         <section className="p-6 border-b">
//           <h2 className="text-[18px] font-semibold text-gray-900 mb-3">
//             Feedback
//           </h2>

//           <div className="space-y-5 text-[14px] leading-relaxed text-gray-800">
//             {feedback.map((f, idx) => (
//               <div key={idx}>
//                 <div className="text-gray-800">
//                   <span className="font-medium">{f.chapter}</span>
//                   <span className="mx-1">:</span>
//                   <span className="">{f.title}</span>
//                 </div>

//                 {/* bullets */}
//                 <ul className="mt-2 list-disc list-inside space-y-1">
//                   {f.comments.map((c, i) => (
//                     <li key={i}>{c}</li>
//                   ))}
//                 </ul>

//                 {/* chapter attachments */}
//                 {f.files && (
//                   <div className="mt-4">
//                     <div className="font-medium text-[16px]">{f.chapter}</div>
//                     <div className="mt-1 space-y-1">
//                       {f.files.map((file, i) => (
//                         <a
//                           key={i}
//                           href={file.href}
//                           className="block text-[#326295] hover:underline"
//                         >
//                           {file.name}
//                         </a>
//                       ))}
//                       {f.files.length === 0 && <span className="text-gray-400">-</span>}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}

//             {/* If a chapter with no files needs a dash row like screenshot */}
//             {!feedback.some(f => f.files && f.files.length === 0) && (
//               <></>
//             )}
//           </div>
//         </section>

//         {/* Your work */}
//         <section className="p-6">
//           <h2 className="text-[18px] font-semibold text-gray-900 mb-3">
//             Your work
//           </h2>
//           <p className="text-[14px] text-gray-800 mb-4">{workDescription}</p>

//           <div className="space-y-4 text-[14px]">
//             {work.map((w, idx) => (
//               <div key={idx}>
//                 <div className="font-medium text-[16px]">{w.chapter}</div>
//                 <div className="mt-1 space-y-1">
//                   {w.files.map((file, i) => (
//                     <a
//                       key={i}
//                       href={file.href}
//                       className="block text-[#326295] hover:underline"
//                     >
//                       {file.name}
//                     </a>
//                   ))}
//                   {w.files.length === 0 && <span className="text-gray-400">-</span>}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
