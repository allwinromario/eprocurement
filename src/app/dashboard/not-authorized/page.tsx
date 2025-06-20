export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Not Authorized</h1>
        <p className="text-gray-700 mb-6">
          You do not have permission to access this page.<br />
          Please contact your administrator if you believe this is a mistake.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  )
} 