import React, { Suspense } from 'react';
import Loading from './components/Loading';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const App: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900">
          <Loading message="Loading dashboard..." />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
};

export default App;