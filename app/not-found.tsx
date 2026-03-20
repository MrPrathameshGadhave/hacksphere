export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#A01C33]">404</h1>
        <p className="mt-3 text-lg font-medium text-[#3B3C3E]">
          Page not found
        </p>
        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}