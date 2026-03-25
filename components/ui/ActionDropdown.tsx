"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export type ActionDropdownItem = {
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
};

type ActionDropdownProps = {
  items: ActionDropdownItem[];
};

export default function ActionDropdown({
  items,
}: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: ActionDropdownItem) => {
    setOpen(false);
    item.onClick?.();
  };

  return (
    <div ref={wrapperRef} className="relative z-20">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
<div className="absolute right-0 top-[calc(100%+8px)] z-[80] min-w-[190px] rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">          <div className="space-y-1">
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                onClick={() => handleItemClick(item)}
                className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  item.variant === "danger"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-[#3B3C3E] hover:bg-[#f8f8f9] hover:text-[#A01C33]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}