// "use client";

// import React, { useState } from "react";
// import Link from "next/link";

// type Assignment = {
//   id: number;
//   title: string;
//   dueDate: string;
//   status: "missed" | "upcoming" | "submitted" | "approved";
//   dateGroup: string;
// };

// const assignments: Assignment[] = [
//   {
//     id: 1,
//     title: "A03_V01: Introduction & Requirements",
//     dueDate: "9:00 PM",
//     status: "missed",
//     dateGroup: "20 April",
//   },
//   {
//     id: 2,
//     title: "A04_V01: Chapters 4-5",
//     dueDate: "9:00 PM",
//     status: "upcoming",
//     dateGroup: "30 April",
//   },
// ];

// const submittedAssignments: Assignment[] = [
//   {
//     id: 4,
//     title: "A02_V01: Feasibility Study",
//     dueDate: "9:00 PM",
//     status: "submitted",
//     dateGroup: "10 April",
//   },
//   {
//     id: 5,
//     title: "A01_V01: Project Proposal",
//     dueDate: "9:00 PM",
//     status: "approved",
//     dateGroup: "1 April",
//   },
// ];

// export default function AssignmentPage() {
//   const [activeTab, setActiveTab] = useState<"open" | "submitted">("open");

//   const getCardStyle = (status: Assignment["status"]) => {
//     switch (status) {
//       case "missed":
//         return "bg-red-100 border border-red-300";
//       case "upcoming":
//         return "bg-orange-100 border border-orange-200";
//       case "submitted":
//         return "bg-green-100 border border-green-300";
//       case "approved":
//         return "bg-green-100 border border-green-300";
//       default:
//         return "bg-white border border-gray-300";
//     }
//   };

//   const groupedAssignments = (data: Assignment[]) => {
//     return data.reduce((acc: Record<string, Assignment[]>, curr) => {
//       acc[curr.dateGroup] = acc[curr.dateGroup] || [];
//       acc[curr.dateGroup].push(curr);
//       return acc;
//     }, {});
//   };

//   const displayedData =
//     activeTab === "open" ? assignments : submittedAssignments;

//   const grouped = groupedAssignments(displayedData);

//   return (
//     <main className="min-h-screen bg-white p-6 font-dbheavent">
//       <div className="flex gap-6 border-b text-2xl font-semibold mb-6">
//         <button
//           className={`pb-2 ${
//             activeTab === "open"
//               ? "border-b-2 border-black text-black"
//               : "text-gray-500"
//           }`}
//           onClick={() => setActiveTab("open")}
//         >
//           Open Tasks
//         </button>
//         <button
//           className={`pb-2 ${
//             activeTab === "submitted"
//               ? "border-b-2 border-black text-black"
//               : "text-gray-500"
//           }`}
//           onClick={() => setActiveTab("submitted")}
//         >
//           Submitted
//         </button>
//       </div>

//       <div className="space-y-6">
//         {Object.entries(grouped).map(([date, tasks]) => (
//           <div key={date}>
//             <div className="text-2xl font-semibold mb-3">{date}</div>
//             {tasks.map((task) => (
//               <Link href={`/assignments/${task.id}`} key={task.id}>
//                 <div
//                   className={`${getCardStyle(
//                     task.status
//                   )} p-5 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md transition`}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <div className="font-semibold text-xl">{task.title}</div>
//                       <div className="text-lg text-gray-600">
//                         Due at {task.dueDate}
//                       </div>
//                     </div>

//                     {task.status === "missed" && (
//                       <div className="text-red-600 font-semibold text-lg">
//                         Missed
//                       </div>
//                     )}
//                     {task.status === "submitted" && (
//                       <div className="text-black font-semibold text-lg">
//                         Submitted
//                       </div>
//                     )}
//                     {task.status === "approved" && (
//                       <div className="text-green-800 font-semibold text-lg">
//                         Approved
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }


// In src/app/(main)/assignments/page.tsx
import { redirect } from "next/navigation";

export default function AssignmentEntry() {
  const role = getUserRole(); // mock this or get from session
  if (role === "advisor") return redirect("/assignments/advisor");
  return redirect("/assignments/student");
}
