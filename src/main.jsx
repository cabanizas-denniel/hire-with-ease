import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RatingsProvider } from './context/RatingsContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { VerificationProvider } from './context/VerificationContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
        <VerificationProvider>
          <RatingsProvider>
              <App />
          </RatingsProvider>
        </VerificationProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
