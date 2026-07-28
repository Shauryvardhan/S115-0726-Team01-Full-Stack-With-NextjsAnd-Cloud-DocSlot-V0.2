import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="font-bold text-gray-900 text-sm">DocSlot</p>
          <p className="text-xs text-gray-400">© 2024 DocSlot Healthcare. All rights reserved.</p>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            About Us
          </Link>
          <Link href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            Contact
          </Link>
          <Link href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
