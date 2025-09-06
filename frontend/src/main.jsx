import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import { Socket } from 'socket.io-client';
import { SocketProvider } from './context/SocketContext';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SocketProvider>
      <App />
      <Toaster closeButton ></Toaster>
    </SocketProvider>
  </Provider>
)
