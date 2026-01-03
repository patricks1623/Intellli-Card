
import React from 'react';

export const CardSkeleton = () => (
  <div className="rounded-2xl p-6 bg-slate-200 dark:bg-slate-800 animate-pulse h-48 w-full" />
);

export const TableSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 space-y-4">
    <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
    <div className="h-32 w-full bg-slate-50 dark:bg-slate-700/50 rounded animate-pulse" />
  </div>
);
