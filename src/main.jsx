import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';
import HenryThemeProvider from './HenryThemeProvider';
import './styles/app.css';
import './components/ui/ui.css';
import './styles/luxury-print.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HenryThemeProvider>
        <App />
      </HenryThemeProvider>
    </Provider>
  </React.StrictMode>,
);
