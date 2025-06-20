export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Dakshin Bharat Gateway Terminal Private Limited
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Berth No: 8, V.O.C Port Trust, Tuticorin-628004, Tamil Nadu, India
          </p>
          <p className="mt-1 text-sm text-gray-500">
            © {new Date().getFullYear()} DBGT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 