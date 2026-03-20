export default function ParticipantProjectDetailsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-[#A01C33]">Project Details</p>
        <h1 className="mt-2 text-3xl font-bold text-[#3B3C3E]">
          Submitted Project Overview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
          View your team project details, selected problem statement, submission
          links, screenshots, and evaluation summary.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <p className="text-sm text-gray-500">Project Title</p>
          <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
            Project Title Placeholder
          </h3>
          <p className="mt-3 text-sm text-gray-500">
            Full project details will appear here after your team submits a
            solution.
          </p>
        </div>

        <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Review Status</p>
          <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">Pending</h3>
          <p className="mt-3 text-sm text-gray-500">
            Judge scores and feedback will be shown when available.
          </p>
        </div>
      </div>
    </section>
  );
}