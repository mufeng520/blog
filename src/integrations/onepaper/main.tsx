import React from 'react';
import ReactDOM from 'react-dom/client';
import HomePreferencesIsland from './islands/HomePreferencesIsland';
import HomeProjectCountIsland from './islands/HomeProjectCountIsland';
import HomeProjectsIsland from './islands/HomeProjectsIsland';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col font-sans">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 md:p-12">
        <header className="mb-4 md:mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <HomePreferencesIsland />
            <div className="pt-1">
              <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">OnePaper</h1>
              <HomeProjectCountIsland />
            </div>
          </div>
        </header>
        <HomeProjectsIsland />
      </div>
    </main>
  </React.StrictMode>
);
