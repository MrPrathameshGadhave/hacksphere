"use client";

type ProblemPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ProblemPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProblemPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
        const active = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-4 text-sm font-semibold transition ${
              active
                ? "bg-[#A01C33] text-white shadow-[0_10px_20px_rgba(160,28,51,0.18)]"
                : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}