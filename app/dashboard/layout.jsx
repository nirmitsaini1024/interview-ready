
'use client';

import Sidebar from "../_components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar stays fixed/sticky on left */}
      <Sidebar />

      {/* Main content scrolls independently */}
      <main className="flex-1 overflow-y-auto">
        <header className="hidden md:flex sticky top-0 z-50 bg-white border-b border-zinc-100 px-6 py-2 h-14 items-center justify-between">
          {/* Left: Welcome Message */}
          <div>
            <h1 className="font-semibold text-gray-700">Welcome to Hirenom</h1>
          </div>

          {/* Right: Empty for now */}
          <div className="flex gap-4 items-center">
            {/* Future: Add any global actions here */}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
