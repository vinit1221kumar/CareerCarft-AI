import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <section className={`cc-card ${className}`}>
      {title ? <h2 className="cc-card-title">{title}</h2> : null}
      <div>{children}</div>
    </section>
  );
}
