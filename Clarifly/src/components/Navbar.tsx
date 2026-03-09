'use client';

import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Clarifly logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Clarifly</h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
