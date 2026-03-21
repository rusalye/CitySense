import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastData } = useApp();

  return (
    <div id="toast" className={toastData.visible ? 'show' : ''}>
      {toastData.visible && (
        <>
          <span>{toastData.icon}</span>
          <span>{toastData.message}</span>
        </>
      )}
    </div>
  );
}
