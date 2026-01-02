import React from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';
import { FiBell, FiUser, FiMoon, FiSun } from 'react-icons/fi';

const HeaderButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}> = ({ children, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm hover:bg-white transition"
  >
    {children}
  </button>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // theme toggle placeholder (no real theme logic included)
  const [dark, setDark] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Top bar */}
      <div className="w-full border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: brand / mobile menu */}
            <div className="flex items-center gap-3">
              {/* mobile menu button */}
              <div className="md:hidden">
                <HeaderButton title="Menu">
                  <RxHamburgerMenu className="w-5 h-5" />
                </HeaderButton>
              </div>

              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold shadow">
                  MA
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-semibold leading-tight">Mixo Ads</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Campaigns Dashboard</div>
                </div>
              </div>
            </div>

            {/* Middle (search slot) */}
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="w-full max-w-2xl">
                {/* prefer using utility classes in JSX for Tailwind v4 */}
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-600 px-3 py-1 gap-2">
                  <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    aria-label="Search campaigns"
                    placeholder="Search campaigns, brands, platforms..."
                    className="w-full bg-transparent placeholder:text-slate-500 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <HeaderButton title="Notifications">
                  <FiBell className="w-5 h-5" />
                </HeaderButton>

                <HeaderButton title="Toggle theme" onClick={() => setDark((s) => !s)}>
                  {dark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </HeaderButton>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm">
                    I
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-medium">Imran</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Product Manager</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
};

export default Layout;