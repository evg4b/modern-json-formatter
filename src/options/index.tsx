import React from 'react';
import { createRoot } from 'react-dom/client';
import { Options } from './options';

createRoot(document.body)
  .render(
    <React.StrictMode>
      <Options/>
    </React.StrictMode>,
  );
