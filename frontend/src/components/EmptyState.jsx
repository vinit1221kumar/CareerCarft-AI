import React from 'react';

export default function EmptyState({ title = 'No data', description = 'Nothing to show yet.', action }) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl">📄</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
