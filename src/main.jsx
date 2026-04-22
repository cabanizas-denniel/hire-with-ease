import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RatingsProvider } from './context/RatingsContext.jsx';
import { VerificationProvider } from './context/VerificationContext.jsx';
import { WorkerModerationProvider } from './context/WorkerModerationContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <VerificationProvider>
          <RatingsProvider>
            <WorkerModerationProvider>
              <App />
            </WorkerModerationProvider>
          </RatingsProvider>
        </VerificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
