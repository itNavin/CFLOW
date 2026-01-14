"use client";

import { useCallback, useEffect, useState } from "react";

export default function ResponsiveDemoPage() {
  // Mobile sidebar open/close state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile sidebar when pressing Escape (accessibility + usability)
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onKeyDown]);

  return (
    // Page uses a column flex layout so footer stays at the bottom
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/*
        Navbar
        - sticky top so it remains visible while scrolling
        - includes hamburger button that is visible only on small screens (lg:hidden)
        - padding scales with breakpoints: px-4 sm:px-6 lg:px-8
      */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Hamburger: visible on small screens only; toggles the mobile sidebar */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Open main menu"
            aria-controls="mobile-sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <span aria-hidden className="text-2xl leading-none">☰</span>
          </button>

          {/* Brand: image scales naturally (h-auto) and text scales with breakpoints */}
          <div className="flex items-center gap-3">
            <img src="/image/SIT-LOGO.png" alt="Site logo" className="h-8 w-auto" />
            <span className="font-semibold text-lg sm:text-xl md:text-2xl">Responsive Layout</span>
          </div>

          {/* Top-level nav (hidden on extra-small screens, visible from sm and up) */}
          <nav className="hidden sm:flex items-center gap-6 text-sm md:text-base">
            <a href="#" className="hover:text-blue-700">Home</a>
            <a href="#" className="hover:text-blue-700">About</a>
            <a href="#" className="hover:text-blue-700">Docs</a>
          </nav>
        </div>
      </header>

      {/* Main area: sidebar + content
         - Flex row at larger screens; on mobile we overlay the sidebar instead
      */}
      <div className="flex-1 flex min-w-0">
        {/*
          Sidebar (desktop)
          - hidden on small screens, visible from lg and up using hidden lg:flex
          - fixed width with w-72, vertical layout
        */}
        <aside className="hidden lg:flex w-72 shrink-0 border-r bg-gray-50">
          <nav className="p-4 w-full">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li><a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Dashboard</a></li>
              <li><a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Projects</a></li>
              <li><a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Team</a></li>
              <li><a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Settings</a></li>
            </ul>
          </nav>
        </aside>

        {/*
          Sidebar (mobile)
          - replaces desktop sidebar on small screens (lg:hidden)
          - uses CSS transforms for smooth slide-in/out: -translate-x-full -> translate-x-0
          - overlay darkens content and closes on click
        */}
        {mobileOpen && (
          <button
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div
          id="mobile-sidebar"
          className={
            "fixed inset-y-0 left-0 z-50 w-72 border-r bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden " +
            (mobileOpen ? "translate-x-0" : "-translate-x-full")
          }
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <span className="font-semibold">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onClick={() => setMobileOpen(false)}
            >
              <span aria-hidden className="text-xl">×</span>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Dashboard</a>
            <a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Projects</a>
            <a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Team</a>
            <a className="block rounded px-3 py-2 hover:bg-gray-100" href="#">Settings</a>
          </nav>
        </div>

        {/*
          Main content
          - container paddings scale with breakpoints
          - cards grid adapts: 1 col (mobile) → 2 (sm) → 3 (lg)
        */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              This page demonstrates a responsive layout with a sticky navbar, a
              desktop-only sidebar, a mobile slide-in menu, and a flexible grid.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <article key={i} className="rounded-lg border bg-white p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-semibold">Card {i + 1}</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">
                    Content scales with font sizes and padding across breakpoints.
                  </p>
                  <img
                    src="/image/SIT.jpg"
                    alt="Example visual"
                    className="mt-3 w-full h-auto rounded"
                  />
                  <button className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-white text-sm sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    Action
                  </button>
                </article>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/*
        Footer
        - stays at bottom thanks to column flex + flex-1 above
        - font and spacing scale with breakpoints
      */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-sm sm:text-base text-gray-600 flex flex-col sm:flex-row items-center sm:justify-between gap-2">
          <p>© {new Date().getFullYear()} Responsive Demo</p>
          <nav className="flex gap-4">
            <a href="#" className="hover:text-blue-700">Privacy</a>
            <a href="#" className="hover:text-blue-700">Terms</a>
            <a href="#" className="hover:text-blue-700">Contact</a>
          </nav>
        </div>
      </footer>

      {/**
       * Implementation notes
       * - Breakpoints: sm, md, lg, xl control font sizes, paddings, and grid columns.
       * - Desktop sidebar: hidden on small screens with `hidden lg:flex`.
       * - Mobile sidebar: `lg:hidden` and uses translate-x to smoothly slide in/out.
       *   Toggle via hamburger button; Escape key and backdrop click close it.
       * - Transitions: `transition-transform duration-300 ease-in-out` for smooth animation.
       * - Accessibility: buttons have `aria-label`, `aria-controls`, `aria-expanded`,
       *   and the mobile sidebar uses `role="dialog"` + `aria-modal`.
       */}
    </div>
  );
}

