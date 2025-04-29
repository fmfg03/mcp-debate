// frontend/src/services/apiService.js
// Servicio base para hacer peticiones a la API

import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      if (error.response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// frontend/src/services/authService.js
// Servicio para operaciones de autenticación

import api from './apiService';

const authService = {
  // Establecer token manualmente (útil al inicializar desde localStorage)
  setToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Registrar nuevo usuario
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      fullName,
    });
    return response.data;
  },

  // Iniciar sesión
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    // Establecer token para futuras peticiones
    const token = response.data.session.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return response.data;
  },

  // Cerrar sesión
  logout: async () => {
    const response = await api.post('/auth/logout');
    // Limpiar token de las cabeceras
    delete api.defaults.headers.common['Authorization'];
    return response.data;
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Actualizar claves API
  updateApiKeys: async (claudeApiKey, chatgptApiKey) => {
    const response = await api.put('/auth/api-keys', {
      claudeApiKey,
      chatgptApiKey,
    });
    return response.data;
  },
};

export default authService;

// frontend/src/services/projectService.js
// Servicio para operaciones con proyectos

import api from './apiService';

const projectService = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Obtener un proyecto específico
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Crear un nuevo proyecto
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Actualizar un proyecto existente
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Eliminar un proyecto
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;

// frontend/src/services/conversationService.js
// Servicio para operaciones con conversaciones

import api from './apiService';

const conversationService = {
  // Obtener todas las conversaciones de un proyecto
  getConversations: async (projectId) => {
    const response = await api.get(`/conversations/project/${projectId}`);
    return response.data;
  },

  // Obtener una conversación específica
  getConversation: async (id) => {
    const response = await api.get(`/conversations/${id}`);
    return response.data;
  },

  // Crear una nueva conversación
  createConversation: async (conversationData) => {
    const response = await api.post('/conversations', conversationData);
    return response.data;
  },

  // Añadir un mensaje a una conversación
  addMessage: async (conversationId, messageData) => {
    const response = await api.post(`/conversations/${conversationId}/message`, messageData);
    return response.data;
  },

  // Solicitar respuesta del Builder
  requestBuilderResponse: async (conversationId, requirements) => {
    const response = await api.post(`/conversations/${conversationId}/builder`, { requirements });
    return response.data;
  },

  // Solicitar evaluación del Judge
  requestJudgeEvaluation: async (conversationId, builderMessageId, requirements) => {
    const response = await api.post(`/conversations/${conversationId}/judge`, {
      builderMessageId,
      requirements,
    });
    return response.data;
  },

  // Cambiar roles de los agentes
  switchRoles: async (conversationId) => {
    const response = await api.post(`/conversations/${conversationId}/switch-roles`);
    return response.data;
  },
};

export default conversationService;

// frontend/src/services/socketService.js
// Servicio para gestionar la conexión con Socket.io

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  // Conectar al servidor de Socket.io
  connect(token) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(this.baseUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      console.log('Socket.io conectado');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Socket.io desconectado: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión con Socket.io:', error);
    });

    return this.socket;
  }

  // Desconectar del servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Verificar si está conectado
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Emitir un evento
  emit(event, data) {
    if (this.isConnected()) {
      this.socket.emit(event, data);
    } else {
      console.error('Intentando emitir evento sin conexión:', event);
    }
  }

  // Registrar manejadores de eventos
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Desregistrar manejadores de eventos
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Singleton
const socketService = new SocketService();
export default socketService;

// frontend/src/services/codeService.js
// Servicio para operaciones con fragmentos de código

import api from './apiService';

const codeService = {
  // Obtener artefactos de código de un proyecto
  getProjectArtifacts: async (projectId) => {
    const response = await api.get(`/code-artifacts/project/${projectId}`);
    return response.data;
  },

  // Obtener un artefacto específico
  getArtifact: async (id) => {
    const response = await api.get(`/code-artifacts/${id}`);
    return response.data;
  },

  // Crear un nuevo artefacto
  createArtifact: async (artifactData) => {
    const response = await api.post('/code-artifacts', artifactData);
    return response.data;
  },

  // Actualizar un artefacto existente
  updateArtifact: async (id, artifactData) => {
    const response = await api.put(`/code-artifacts/${id}`, artifactData);
    return response.data;
  },

  // Eliminar un artefacto
  deleteArtifact: async (id) => {
    const response = await api.delete(`/code-artifacts/${id}`);
    return response.data;
  },

  // Ejecutar código
  runCode: async (code, language = 'javascript') => {
    const response = await api.post('/code-runner', {
      code,
      language,
    });
    return response.data;
  },
};

export default codeService;
