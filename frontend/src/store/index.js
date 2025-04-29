// frontend/src/store/index.js
// Configuración del store principal de Redux

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import conversationReducer from './slices/conversationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    conversation: conversationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones no serializables para socket.io
        ignoredActions: ['conversation/connectSocket/fulfilled'],
        // Ignorar paths no serializables
        ignoredPaths: ['conversation.socket'],
      },
    }),
});

export default store;

// frontend/src/store/slices/authSlice.js
// Slice para gestionar autenticación y datos de usuario

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      // Guardar token en localStorage
      localStorage.setItem('token', response.session.access_token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName }, { rejectWithValue }) => {
    try {
      const response = await authService.register(email, password, fullName);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      // Eliminar token de localStorage
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateApiKeys = createAsyncThunk(
  'auth/updateApiKeys',
  async ({ claudeApiKey, chatgptApiKey }, { rejectWithValue }) => {
    try {
      const response = await authService.updateApiKeys(claudeApiKey, chatgptApiKey);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Inicializar desde localStorage al cargar la aplicación
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Configurar token en el servicio
        authService.setToken(token);
        // Obtener perfil del usuario
        const user = await dispatch(getProfile()).unwrap();
        return { token, user };
      } catch (error) {
        // Si hay un error (token expirado, etc.), limpiar localStorage
        localStorage.removeItem('token');
        return null;
      }
    }
    
    return null;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.session.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        // No autenticar automáticamente después del registro
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Limpiar de todos modos
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update API Keys
      .addCase(updateApiKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateApiKeys.fulfilled, (state) => {
        state.isLoading = false;
        // La respuesta no contiene las claves reales, solo placeholders
      })
      .addCase(updateApiKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// frontend/src/store/slices/projectsSlice.js
// Slice para gestionar proyectos

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../../services/projectService';

// Estado inicial
const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

// Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getAllProjects();
      return response.projects;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await projectService.getProject(id);
      return response.project;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(projectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(id, projectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectsError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch One Project
      .addCase(fetchProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload.project);
        state.currentProject = action.payload.project;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        // Actualizar en la lista de proyectos
        const index = state.projects.findIndex(
          (p) => p.id === action.payload.project.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload.project;
        }
        // Actualizar proyecto actual si es el mismo
        if (state.currentProject && state.currentProject.id === action.payload.project.id) {
          state.currentProject = action.payload.project;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        // Eliminar de la lista de proyectos
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        // Limpiar proyecto actual si es el mismo
        if (state.currentProject && state.currentProject.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProjectsError, clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;

// frontend/src/store/slices/conversationSlice.js
// Slice para gestionar conversaciones y mensajes

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import conversationService from '../../services/conversationService';
import socketService from '../../services/socketService';

// Estado inicial
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  socket: null,
  isConnected: false,
  isLoading: false,
  isThinking: false, // Builder o Judge están procesando
  error: null,
};

// Thunks
export const fetchConversations = createAsyncThunk(
  'conversation/fetchAll',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await conversationService.getConversations(projectId);
      return response.conversations;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'conversation/fetchOne',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await conversationService.getConversation(conversationId);
      return response.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'conversation/create',
  async (conversationData, { rejectWithValue }) => {
    try {
      const response = await conversationService.createConversation(conversationData);
      return response.conversation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const connectSocket = createAsyncThunk(
  'conversation/connectSocket',
  async (token, { dispatch }) => {
    // Desconectar socket existente si hay uno
    if (socketService.socket) {
      socketService.disconnect();
    }
    
    // Conectar nuevo socket
    const socket = socketService.connect(token);
    
    // Configurar escuchas para eventos del socket
    socket.on('new_message', (message) => {
      dispatch(receiveMessage(message));
    });
    
    socket.on('builder_thinking', () => {
      dispatch(setThinking(true));
    });
    
    socket.on('builder_completed', () => {
      dispatch(setThinking(false));
    });
    
    socket.on('builder_error', (data) => {
      dispatch(setError(data.error));
      dispatch(setThinking(false));
    });
    
    socket.on('judge_thinking', () => {
      dispatch(setThinking(true));
    });
    
    socket.on('judge_completed', () => {
      dispatch(setThinking(false));
    });
    
    socket.on('judge_error', (data) => {
      dispatch(setError(data.error));
      dispatch(setThinking(false));
    });
    
    socket.on('roles_switched', (data) => {
      dispatch(rolesUpdated(data));
    });
    
    socket.on('error', (data) => {
      dispatch(setError(data.message));
    });
    
    return socket;
  }
);

export const joinConversation = createAsyncThunk(
  'conversation/join',
  async (conversationId, { getState }) => {
    const { socket } = getState().conversation;
    
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
    
    return conversationId;
  }
);

export const leaveConversation = createAsyncThunk(
  'conversation/leave',
  async (conversationId, { getState }) => {
    const { socket } = getState().conversation;
    
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
    
    return conversationId;
  }
);

export const sendMessage = createAsyncThunk(
  'conversation/sendMessage',
  async ({ conversationId, content }, { getState }) => {
    const { socket } = getState().conversation;
    
    if (socket) {
      socket.emit('send_user_message', { conversationId, content });
    }
    
    return { conversationId, content, sending: true };
  }
);

export const requestBuilderResponse = createAsyncThunk(
  'conversation/requestBuilder',
  async ({ conversationId, requirements }, { getState }) => {
    const { socket } = getState().conversation;
    
    if (socket) {
      socket.emit('request_builder_response', { 
        conversationId, 
        requirements 
      });
    }
    
    return conversationId;
  }
);

export const requestJudgeEvaluation = createAsyncThunk(
  'conversation/requestJudge',
  async ({ conversationId, builderMessageId, requirements }, { getState }) => {
    const { socket } = getState().conversation;
    
    if (socket) {
      socket.emit('request_judge_evaluation', { 
        conversationId, 
        builderMessageId,
        requirements 
      });
    }
    
    return conversationId;
  }
);

export const switchRoles = createAsyncThunk(
  'conversation/switchRoles',
  async ({ conversationId }, { getState }) => {
    const { socket } = getState().conversation;
    
    if (socket) {
      socket.emit('switch_roles', { conversationId });
    }
    
    return conversationId;
  }
);

// Slice
const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    clearConversationError: (state) => {
      state.error = null;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    receiveMessage: (state, action) => {
      // Si el mensaje ya existe (por ej. enviado por nosotros), reemplazarlo
      const index = state.messages.findIndex(
        (m) => m.id === action.payload.id || (m.sending && m.tmpId === action.payload.id)
      );
      
      if (index !== -1) {
        state.messages[index] = action.payload;
      } else {
        state.messages.push(action.payload);
      }
    },
    setThinking: (state, action) => {
      state.isThinking = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isThinking = false;
    },
    rolesUpdated: (state, action) => {
      if (state.currentConversation && state.currentConversation.id === action.payload.conversationId) {
        state.currentConversation.builder_llm = action.payload.builder_llm;
        state.currentConversation.judge_llm = action.payload.judge_llm;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch One Conversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations.push(action.payload);
        state.currentConversation = action.payload;
        state.messages = [];
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Connect Socket
      .addCase(connectSocket.fulfilled, (state, action) => {
        state.socket = action.payload;
        state.isConnected = true;
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state, action) => {
        // Añadir mensaje temporal optimista
        const tmpMessage = {
          id: `tmp-${Date.now()}`,
          tmpId: `tmp-${Date.now()}`,
          conversation_id: action.meta.arg.conversationId,
          content: action.meta.arg.content,
          role: 'user',
          llm_provider: null,
          created_at: new Date().toISOString(),
          sending: true
        };
        state.messages.push(tmpMessage);
      });
  },
});

export const {
  clearConversationError,
  clearCurrentConversation,
  receiveMessage,
  setThinking,
  setError,
  rolesUpdated
} = conversationSlice.actions;
export default conversationSlice.reducer;

// frontend/src/store/slices/uiSlice.js
// Slice para gestionar estados de UI

import { createSlice } from '@reduxjs/toolkit';

// Estado inicial
const initialState = {
  darkMode: false,
  sidebarOpen: true,
  notifications: [],
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      
      // Aplicar al elemento HTML
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Guardar preferencia
      localStorage.setItem('darkMode', state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      
      // Aplicar al elemento HTML
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Guardar preferencia
      localStorage.setItem('darkMode', state.darkMode);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    initializeUiState: (state) => {
      // Cargar preferencia de tema
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        state.darkMode = savedDarkMode === 'true';
      } else {
        // Detectar preferencia del sistema
        state.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      // Aplicar tema
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  initializeUiState,
} = uiSlice.actions;
export default uiSlice.reducer;

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
