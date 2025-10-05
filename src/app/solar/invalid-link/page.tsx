// app/solar/invalid-link/page.tsx
export default function InvalidLink() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm text-center">
        <h1 className="text-xl font-semibold mb-2">Invalid link</h1>
        <p className="text-sm text-gray-600">The reset link is missing or malformed. Please request a new one.</p>
      </div>
    </div>
  );
}
