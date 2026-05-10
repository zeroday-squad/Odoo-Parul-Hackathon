import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full w-full py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
    </div>
  );
}
