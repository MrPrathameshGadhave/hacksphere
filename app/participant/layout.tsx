import ParticipantSidebar from "@/components/layout/ParticipantSidebar";
import ParticipantTopbar from "@/components/layout/ParticipantTopbar";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <div className="flex min-h-screen">
        <ParticipantSidebar />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[290px]">
          <ParticipantTopbar />
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}