import React from 'react';
import Footer from './Footer';
import RightSidebar from './RightSidebar';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <RightSidebar />
      <div id="main-content" style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
