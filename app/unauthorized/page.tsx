export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-[#A01C33]">Access Denied</h1>
        <p className="mt-3 text-sm text-[#3B3C3E]">
          You do not have permission to access this page.
        </p>
      </div>
    </main>
  );
}