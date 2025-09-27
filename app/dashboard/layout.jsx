
'use client';

import Sidebar from "../_components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {}
      <Sidebar />

      {}
      <main className="flex-1 overflow-y-auto">
        <header className="hidden md:flex sticky top-0 z-50 bg-white border-b border-zinc-100 px-6 py-2 h-14 items-center justify-between">
          {}
          <div>
            <h1 className="font-semibold text-gray-700">Welcome to Swipe Ai</h1>
          </div>

          {}
          <div className="flex gap-4 items-center">
            {}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
