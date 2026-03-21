import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidenav from './Sidenav';
import Toast from './Toast';

export default function MainLayout() {
  return (
    <div className="shell">
      <Topbar />
      <Sidenav />
      <div className="content-area">
        <Outlet />
      </div>
      <Toast />
    </div>
  );
}
