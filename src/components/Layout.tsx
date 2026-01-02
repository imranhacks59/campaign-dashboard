import React from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';
import { FiBell, FiMoon, FiSun } from 'react-icons/fi';

const HeaderButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}> = ({ children, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/6 backdrop-blur-sm border border-transparent hover:border-slate-200 hover:bg-white/8 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
  >
    {children}
  </button>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = React.useState(false);

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100"
      style={{ ['--header-height' as any]: '64px' }}
    >
      {/* Sticky Top bar (height = var(--header-height)) */}
      <header
        className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: brand / menu */}
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <HeaderButton title="Menu">
                  <RxHamburgerMenu className="w-5 h-5" />
                </HeaderButton>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center text-white font-semibold shadow">
                  MA
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-semibold leading-tight">Mixo Ads</div>
                  <div className="text-xs text-slate-400">Campaigns Dashboard</div>
                </div>
              </div>
            </div>

            {/* Middle: search placeholder */}
            <div className="flex-1 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="hidden sm:flex items-center bg-slate-800 rounded-md border border-slate-800 px-3 py-1 gap-2">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    aria-label="Search campaigns"
                    placeholder="Search campaigns, brands, platforms..."
                    className="w-full bg-transparent placeholder:text-slate-400 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <HeaderButton title="Notifications">
                  <FiBell className="w-5 h-5" />
                </HeaderButton>

                <HeaderButton title="Toggle theme" onClick={() => setDark((s) => !s)}>
                  {dark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </HeaderButton>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-slate-800 transition focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm">
                    I
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-medium">Imran</span>
                    <span className="text-xs text-slate-400">Product Manager</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* main — add top padding equal to the header height so content doesn't jump under it */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ paddingTop: 'calc(24px)' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;