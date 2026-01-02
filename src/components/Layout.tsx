import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Mixo Ads — Campaigns Dashboard</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;