import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪲</span>
            <span className="font-bold text-gray-900">ScanBugs</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              IA VISION
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/scanner" className="hover:text-gray-900 transition-colors">Scanner</Link>
            <Link href="/library" className="hover:text-gray-900 transition-colors">Bibliothèque</Link>
            <Link href="/my-scans" className="hover:text-gray-900 transition-colors">Mes scans</Link>
            <Link href="/support" className="hover:text-gray-900 transition-colors">Support</Link>
          </nav>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ScanBugs. Identification par IA.
          </p>
        </div>
      </div>
    </footer>
  );
}
