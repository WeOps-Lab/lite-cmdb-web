import React from 'react';
import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ fontSize: '2rem', color: '#ff4d4f' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1.2rem' }}>Sorry, the page you are looking for does not exist.</p>
      <Link legacyBehavior href="/" passHref>
        <a style={{ color: '#1890ff' }}>Go back to the homepage</a>
      </Link>
    </div>
  );
};

export default NotFoundPage;
