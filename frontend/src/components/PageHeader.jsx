import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="md:flex md:items-center md:justify-between mb-8">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-textPrimary sm:truncate sm:tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 flex text-sm text-textSecondary">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}
