"use client";

import React from "react";

export type FileType = "PDF" | "DOCX" | "ZIP";

export type Deliverable = {
  id: string;
  name: string;
  requiredTypes: FileType[]; // e.g. ["PDF","DOCX"]
};

type Props = {
  value: Deliverable;
  onChange: (patch: Partial<Deliverable>) => void;
  onRemove?: () => void;
  showRemove?: boolean;
};

const ALL_TYPES: FileType[] = ["PDF", "DOCX", "ZIP"];

export default function DeliverableFields({
  value,
  onChange,
  onRemove,
  showRemove = false,
}: Props) {
  const toggleType = (t: FileType) => {
    const exists = value.requiredTypes.includes(t);
    onChange({
      requiredTypes: exists
        ? value.requiredTypes.filter((x) => x !== t)
        : [...value.requiredTypes, t],
    });
  };

  return (
    <div className="rounded-xl border border-gray-300 p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Chapter 4"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-1">
          File Require <span className="text-red-500">*</span>
        </div>
        <div className="space-y-2">
          {ALL_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value.requiredTypes.includes(t)}
                onChange={() => toggleType(t)}
                className="h-4 w-4"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {showRemove && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:underline"
          >
            Remove deliverable
          </button>
        </div>
      )}
    </div>
  );
}
