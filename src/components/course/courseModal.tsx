import { Course } from "@/types/api/course";
import { useState, useRef, useEffect } from "react";

export const CourseModal = ({
    mode,
    initial,
    onClose,
    onSubmit,
}: {
    mode: "create" | "edit";
    initial?: Course;
    onClose: () => void;
    onSubmit: (c: Omit<Course, "id" | "createdAt" | "createdById">) => void | Promise<void>;
}) => {
    const [program, setProgram] = useState<"CS" | "DSI">(initial?.program ?? "CS");
    const [name, setName] = useState<string>(initial?.name ?? "");
    const [description, setDescription] = useState<string>(initial?.description ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = name.trim().length > 0 && !!program;

    const panelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        const onClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [onClose]);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                program,
                description: description.trim(),
            });
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40" />
            <div className="fixed inset-0 z-40 grid place-items-center p-4">
                <div
                    ref={panelRef}
                    className="w-full max-w-2xl rounded-2xl border bg-white shadow-xl overflow-hidden"
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h3 className="text-[28px] font-medium">
                            {mode === "create" ? "Create Course" : "Edit Course"}
                        </h3>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="text-2xl leading-none text-red-500 hover:text-red-600"
                        >
                            ×
                        </button>
                    </div>

                    <div className="px-6 py-5 space-y-6 text-black">
                        <div>
                            <div className="text-[18px] font-semibold mb-2">
                                Course<span className="text-red-500">*</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="program"
                                        value="CS"
                                        checked={program === "CS"}
                                        onChange={() => setProgram("CS")}
                                    />
                                    CS
                                </label>
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="program"
                                        value="DSI"
                                        checked={program === "DSI"}
                                        onChange={() => setProgram("DSI")}
                                    />
                                    DSI
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="text-[18px] font-semibold mb-2">
                                Course name<span className="text-red-500">*</span>
                            </div>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., CSC498-CSC499[2026]"
                                className="w-full text-[16px] rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                            />
                        </div>

                        <div>
                            <div className="text-[18px] font-semibold mb-2">Description</div>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                                className="w-full text-[16px] rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#326295]"
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t flex justify-end">
                        <button
                            disabled={!canSubmit}
                            onClick={handleSubmit}
                            className="rounded px-6 py-2 text-white shadow disabled:opacity-60 bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320]"
                        >
                            {isSubmitting ? (mode === "create" ? "Creating..." : "Saving...") : (mode === "create" ? "Create" : "Save")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
