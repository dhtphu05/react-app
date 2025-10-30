import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { APP_BASE_PATH } from '@/config/constants';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

const routerBasename = APP_BASE_PATH || undefined;

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
