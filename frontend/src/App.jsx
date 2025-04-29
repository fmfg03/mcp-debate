// frontend/src/App.jsx
// Componente principal de la aplicación

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import { initializeUiState } from './store/slices/uiSlice';

// Páginas
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectView from './pages/ProjectView';
import NewProject from './pages/NewProject';
import EditProject from './pages/EditProject';
import ConversationView from './pages/ConversationView';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Protección de rutas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Inicializar autenticación desde localStorage
    dispatch(initializeAuth());
    
    // Inicializar preferencias de UI
    dispatch(initializeUiState());
  }, [dispatch]);
  
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
        <Route path="/projects/new" element={<PrivateRoute><NewProject /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectView /></PrivateRoute>} />
        <Route path="/projects/:id/edit" element={<PrivateRoute><EditProject /></PrivateRoute>} />
        <Route path="/conversations/:id" element={<PrivateRoute><ConversationView /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;

// frontend/src/pages/NotFound.jsx
// Página 404 - No encontrado

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Página no encontrada
        </h2>
        <p className="mt-6 text-base text-gray-500 dark:text-gray-400">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

// frontend/src/main.jsx
// Punto de entrada de la aplicación

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// frontend/src/index.css
// Estilos globales con Tailwind CSS

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Estilos personalizados adicionales */
body {
  @apply antialiased text-gray-900 dark:text-white;
}

:root {
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-700: #1d4ed8;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Transiciones para el modo oscuro */
.dark {
  color-scheme: dark;
}

/* Transiciones suaves */
* {
  @apply transition-colors duration-200 ease-in-out;
}

/* Ajustes para Mobile */
@media (max-width: 640px) {
  .container {
    @apply px-4;
  }
}

// frontend/tailwind.config.js
// Configuración de Tailwind CSS

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // o 'media' para seguir preferencias del sistema
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

// frontend/vite.config.js
// Configuración de Vite

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

// frontend/package.json
// Dependencias del frontend

{
  "name": "mcp-system-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@reduxjs/toolkit": "^1.9.5",
    "axios": "^1.5.0",
    "date-fns": "^2.30.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^4.10.1",
    "react-redux": "^8.1.2",
    "react-router-dom": "^6.15.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.4",
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.15",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.28",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5"
  }
}

// backend/package.json
// Dependencias del backend

{
  "name": "mcp-system-backend",
  "version": "0.1.0",
  "description": "Backend for MCP System",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.10.0",
    "@supabase/supabase-js": "^2.33.1",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^6.9.0",
    "helmet": "^7.0.0",
    "openai": "^4.0.0",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "jest": "^29.6.4",
    "nodemon": "^3.0.1",
    "supertest": "^6.3.3"
  }
}

// .env.example
// Archivo de ejemplo para variables de entorno

# API
API_PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_here

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_TIME=900000

# Application Limits
PROJECT_LIMIT=10
CONVERSATION_HISTORY_LIMIT=100
