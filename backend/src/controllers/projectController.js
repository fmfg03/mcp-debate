// backend/src/controllers/projectController.js
// Controlador para operaciones de proyectos

import { getById, create, update, remove } from '../config/supabase.js';
import { supabaseClient } from '../config/supabase.js';

/**
 * Controlador para gestionar proyectos
 */
export const projectController = {
  /**
   * Obtener todos los proyectos de un usuario
   */
  async getAllProjects(req, res) {
    try {
      const userId = req.user.id;
      
      // Consultar proyectos donde el usuario es propietario o colaborador
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
        .order('updated_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ projects: data });
    } catch (err) {
      console.error('Error al obtener proyectos:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener proyectos' });
    }
  },
  
  /**
   * Obtener un proyecto específico por ID
   */
  async getProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verificar acceso al proyecto (propietario o colaborador)
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', id)
        .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Proyecto no encontrado o sin acceso' });
      }
      
      return res.status(200).json({ project: data });
    } catch (err) {
      console.error('Error al obtener proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener el proyecto' });
    }
  },
  
  /**
   * Crear un nuevo proyecto
   */
  async createProject(req, res) {
    try {
      const { name, description, config, tags } = req.body;
      const userId = req.user.id;
      
      // Validar datos de entrada
      if (!name) {
        return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
      }
      
      // Crear nuevo proyecto
      const newProject = {
        name,
        description: description || '',
        owner_id: userId,
        collaborators: [],
        status: 'active',
        config: config || {},
        tags: tags || [],
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const { data, error } = await create('projects', newProject);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(201).json({ project: data[0] });
    } catch (err) {
      console.error('Error al crear proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al crear el proyecto' });
    }
  },
  
  /**
   * Actualizar un proyecto existente
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status, config, tags, collaborators } = req.body;
      const userId = req.user.id;
      
      // Verificar que el usuario es propietario del proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      if (projectData.owner_id !== userId) {
        return res.status(403).json({ error: 'Solo el propietario puede actualizar el proyecto' });
      }
      
      // Preparar datos de actualización
      const updates = {
        updated_at: new Date()
      };
      
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (status) updates.status = status;
      if (config) updates.config = config;
      if (tags) updates.tags = tags;
      if (collaborators) updates.collaborators = collaborators;
      
      // Actualizar proyecto
      const { data, error } = await update('projects', id, updates);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ project: data[0] });
    } catch (err) {
      console.error('Error al actualizar proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al actualizar el proyecto' });
    }
  },
  
  /**
   * Eliminar un proyecto
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verificar que el usuario es propietario del proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      if (projectData.owner_id !== userId) {
        return res.status(403).json({ error: 'Solo el propietario puede eliminar el proyecto' });
      }
      
      // Eliminar proyecto
      const { error } = await remove('projects', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al eliminar el proyecto' });
    }
  }
};

// backend/src/controllers/conversationController.js
// Controlador para operaciones de conversaciones

import { supabaseClient } from '../config/supabase.js';
import { create, update, getById } from '../config/supabase.js';
import { BuilderAgent } from '../langchain/agents/builder.js';
import { JudgeAgent } from '../langchain/agents/judge.js';
import { TokenService } from '../services/tokenService.js';

/**
 * Controlador para gestionar conversaciones entre agentes
 */
export const conversationController = {
  /**
   * Obtener todas las conversaciones de un proyecto
   */
  async getConversations(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      // Verificar acceso al proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, owner_id, collaborators')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = projectData.owner_id === userId || 
                         (projectData.collaborators && projectData.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso al proyecto' });
      }
      
      // Obtener conversaciones
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ conversations: data });
    } catch (err) {
      console.error('Error al obtener conversaciones:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener conversaciones' });
    }
  },
  
  /**
   * Obtener una conversación específica por ID
   */
  async getConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Obtener conversación con proyecto relacionado
      const { data: conversationData, error: conversationError } = await supabaseClient
        .from('conversations')
        .select('*, project:project_id(owner_id, collaborators)')
        .eq('id', id)
        .single();
      
      if (conversationError) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = conversationData.project.owner_id === userId || 
                         (conversationData.project.collaborators && 
                          conversationData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a esta conversación' });
      }
      
      // Obtener mensajes de la conversación
      const { data: messages, error: messagesError } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        return res.status(400).json({ error: messagesError.message });
      }
      
      // Combinar datos
      const result = {
        ...conversationData,
        messages: messages || []
      };
      
      return res.status(200).json({ conversation: result });
    } catch (err) {
      console.error('Error al obtener conversación:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener la conversación' });
    }
  },
  
  /**
   * Crear una nueva conversación
   */
  async createConversation(req, res) {
    try {
      const { projectId, title, builderLlm, judgeLlm } = req.body;
      const userId = req.user.id;
      
      // Verificar acceso al proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, owner_id, collaborators')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = projectData.owner_id === userId || 
                         (projectData.collaborators && 
                          projectData.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso al proyecto' });
      }
      
      // Crear nueva conversación
      const newConversation = {
        project_id: projectId,
        title: title || `Conversación ${new Date().toLocaleString()}`,
        builder_llm: builderLlm || 'claude',
        judge_llm: judgeLlm || 'chatgpt',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      };
      
      const { data, error } = await create('conversations', newConversation);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(201).json({ conversation: data[0] });
    } catch (err) {
      console.error('Error al crear conversación:', err);
      return res.status(500).json({ error: 'Error del servidor al crear la conversación' });
    }
  },
  
  /**
   * Añadir un mensaje a una conversación
   */
  async addMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const { role, content, llmProvider } = req.body;
      const userId = req.user.id;
      
      // Verificar que la conversación existe y el usuario tiene acceso
      const { data: conversationData, error: conversationError } = await supabaseClient
        .from('conversations')
        .select('*, project:project_id(owner_id, collaborators)')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = conversationData.project.owner_id === userId || 
                         (conversationData.project.collaborators && 
                          conversationData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a esta conversación' });
      }
      
      // Estimar tokens
      const tokenService = new TokenService();
      const tokenCount = tokenService.estimateTokenCount(content);
      
      // Crear nuevo mensaje
      const newMessage = {
        conversation_id: conversationId,
        role: role || 'user', // 'user', 'builder', 'judge'
        llm_provider: llmProvider || null, // para mensajes de LLM: 'claude', 'chatgpt'
        content,
        token_count: tokenCount,
        created_at: new Date(),
        metadata: {}
      };
      
      const { data, error } = await create('messages', newMessage);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Actualizar timestamp de la conversación
      await update('conversations', conversationId, { updated_at: new Date() });
      
      return res.status(201).json({ message: data[0] });
    } catch (err) {
      console.error('Error al añadir mensaje:', err);
      return res.status(500).json({ error: 'Error del servidor al añadir el mensaje' });
    }
  },
  
  /**
   * Generar respuesta del Builder
   */
  async generateBuilderResponse(req, res) {
    try {
      const { conversationId } = req.params;
      const { requirements } = req.body;
      const userId = req.user.id;
      
      // Verificar que la conversación existe y el usuario tiene acceso
      const { data: conversationData, error: conversationError } = await supabaseClient
        .from('conversations')
        .select('*, project:project_id(id, owner_id, collaborators, description)')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = conversationData.project.owner_id === userId || 
                         (conversationData.project.collaborators && 
                          conversationData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a esta conversación' });
      }
      
      // Obtener las claves API del usuario
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('api_keys')
        .eq('id', userId)
        .single();
      
      if (userError) {
        return res.status(400).json({ error: 'No se pudo obtener las claves API' });
      }
      
      const apiKeys = userData.api_keys || {};
      const builderProvider = conversationData.builder_llm;
      
      // Verificar que existen las claves necesarias
      if (!apiKeys[builderProvider]) {
        return res.status(400).json({ error: `Clave API no configurada para ${builderProvider}` });
      }
      
      // Obtener mensajes anteriores
      const { data: messages, error: messagesError } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        return res.status(400).json({ error: messagesError.message });
      }
      
      // Crear agente Builder
      const builderAgent = new BuilderAgent(
        builderProvider,
        apiKeys[builderProvider],
        { temperature: 0.7, maxTokens: 2000 }
      );
      
      // Generar respuesta
      const response = await builderAgent.generateResponse(
        conversationData.project.id,
        requirements || conversationData.project.description,
        messages || []
      );
      
      // Guardar la respuesta como un mensaje
      const newMessage = {
        conversation_id: conversationId,
        role: 'builder',
        llm_provider: builderProvider,
        content: response.content,
        token_count: response.totalTokens,
        created_at: new Date(),
        metadata: {
          model: response.model,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          responseTime: response.responseTime
        }
      };
      
      const { data: messageData, error: messageError } = await create('messages', newMessage);
      
      if (messageError) {
        return res.status(400).json({ error: messageError.message });
      }
      
      // Actualizar timestamp de la conversación
      await update('conversations', conversationId, { updated_at: new Date() });
      
      // Registrar uso de tokens
      const tokenService = new TokenService();
      await tokenService.logTokenUsage(
        conversationData.project.id,
        conversationId,
        builderProvider,
        response.promptTokens,
        response.completionTokens,
        response.model
      );
      
      return res.status(200).json({ message: messageData[0] });
    } catch (err) {
      console.error('Error al generar respuesta del Builder:', err);
      return res.status(500).json({ error: 'Error del servidor al generar respuesta del Builder' });
    }
  },
  
  /**
   * Generar evaluación del Judge
   */
  async generateJudgeEvaluation(req, res) {
    try {
      const { conversationId } = req.params;
      const { builderMessageId, requirements } = req.body;
      const userId = req.user.id;
      
      // Verificar que la conversación existe y el usuario tiene acceso
      const { data: conversationData, error: conversationError } = await supabaseClient
        .from('conversations')
        .select('*, project:project_id(id, owner_id, collaborators, description)')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = conversationData.project.owner_id === userId || 
                         (conversationData.project.collaborators && 
                          conversationData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a esta conversación' });
      }
      
      // Obtener las claves API del usuario
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('api_keys')
        .eq('id', userId)
        .single();
      
      if (userError) {
        return res.status(400).json({ error: 'No se pudo obtener las claves API' });
      }
      
      const apiKeys = userData.api_keys || {};
      const judgeProvider = conversationData.judge_llm;
      
      // Verificar que existen las claves necesarias
      if (!apiKeys[judgeProvider]) {
        return res.status(400).json({ error: `Clave API no configurada para ${judgeProvider}` });
      }
      
      // Obtener mensajes anteriores
      const { data: messages, error: messagesError } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        return res.status(400).json({ error: messagesError.message });
      }
      
      // Obtener el mensaje del Builder a evaluar
      let builderMessage;
      if (builderMessageId) {
        const { data: msgData, error: msgError } = await getById('messages', builderMessageId);
        if (msgError || !msgData) {
          return res.status(404).json({ error: 'Mensaje del Builder no encontrado' });
        }
        builderMessage = msgData;
      } else {
        // Si no se especifica, usar el último mensaje del Builder
        builderMessage = [...messages]
          .reverse()
          .find(msg => msg.role === 'builder');
          
        if (!builderMessage) {
          return res.status(400).json({ error: 'No hay mensaje del Builder para evaluar' });
        }
      }
      
      // Crear agente Judge
      const judgeAgent = new JudgeAgent(
        judgeProvider,
        apiKeys[judgeProvider],
        { temperature: 0.5, maxTokens: 2000 }
      );
      
      // Generar evaluación
      const response = await judgeAgent.generateEvaluation(
        conversationData.project.id,
        requirements || conversationData.project.description,
        builderMessage.content,
        messages || []
      );
      
      // Extraer puntuación de la evaluación
      const score = judgeAgent.extractScore(response.content) || null;
      
      // Guardar la evaluación como un mensaje
      const newMessage = {
        conversation_id: conversationId,
        role: 'judge',
        llm_provider: judgeProvider,
        content: response.content,
        token_count: response.totalTokens,
        created_at: new Date(),
        metadata: {
          model: response.model,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          responseTime: response.responseTime,
          evaluatedMessageId: builderMessage.id,
          score
        }
      };
      
      const { data: messageData, error: messageError } = await create('messages', newMessage);
      
      if (messageError) {
        return res.status(400).json({ error: messageError.message });
      }
      
      // Guardar evaluación en tabla específica si hay puntuación
      if (score !== null) {
        const evaluation = {
          conversation_id: conversationId,
          message_id: messageData[0].id,
          created_at: new Date(),
          score,
          feedback: response.content,
          criteria: {
            functionality: null,
            codeQuality: null,
            usability: null,
            performance: null,
            security: null
          }
        };
        
        await create('evaluations', evaluation);
      }
      
      // Actualizar timestamp de la conversación
      await update('conversations', conversationId, { updated_at: new Date() });
      
      // Registrar uso de tokens
      const tokenService = new TokenService();
      await tokenService.logTokenUsage(
        conversationData.project.id,
        conversationId,
        judgeProvider,
        response.promptTokens,
        response.completionTokens,
        response.model
      );
      
      return res.status(200).json({ message: messageData[0] });
    } catch (err) {
      console.error('Error al generar evaluación del Judge:', err);
      return res.status(500).json({ error: 'Error del servidor al generar evaluación del Judge' });
    }
  },
  
  /**
   * Cambiar roles de los agentes
   */
  async switchRoles(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      
      // Verificar que la conversación existe y el usuario tiene acceso
      const { data: conversationData, error: conversationError } = await supabaseClient
        .from('conversations')
        .select('*, project:project_id(owner_id, collaborators)')
        .eq('id', conversationId)
        .single();
      
      if (conversationError) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = conversationData.project.owner_id === userId || 
                         (conversationData.project.collaborators && 
                          conversationData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a esta conversación' });
      }
      
      // Intercambiar roles
      const updates = {
        builder_llm: conversationData.judge_llm,
        judge_llm: conversationData.builder_llm,
        updated_at: new Date()
      };
      
      const { data, error } = await update('conversations', conversationId, updates);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Crear mensaje de sistema sobre el cambio de roles
      const systemMessage = {
        conversation_id: conversationId,
        role: 'system',
        llm_provider: null,
        content: `Roles cambiados: ${conversationData.builder_llm} ahora es Judge y ${conversationData.judge_llm} ahora es Builder.`,
        token_count: 0,
        created_at: new Date(),
        metadata: {
          action: 'switch_roles',
          previous: {
            builder: conversationData.builder_llm,
            judge: conversationData.judge_llm
          },
          current: {
            builder: conversationData.judge_llm,
            judge: conversationData.builder_llm
          }
        }
      };
      
      await create('messages', systemMessage);
      
      return res.status(200).json({ 
        message: 'Roles cambiados correctamente',
        conversation: data[0]
      });
    } catch (err) {
      console.error('Error al cambiar roles:', err);
      return res.status(500).json({ error: 'Error del servidor al cambiar roles' });
    }
  }
};

// backend/src/controllers/authController.js
// Controlador para autenticación y gestión de usuarios

import { supabaseClient } from '../config/supabase.js';
import { create, update } from '../config/supabase.js';
import { config } from '../config/env.js';

/**
 * Controlador para gestionar autenticación y usuarios
 */
export const authController = {
  /**
   * Registrar un nuevo usuario
   */
  async register(req, res) {
    try {
      const { email, password, fullName } = req.body;
      
      // Validar datos de entrada
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }
      
      // Registrar usuario con Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      });
      
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
      
      // Crear registro en tabla de usuarios
      if (authData.user) {
        const newUser = {
          id: authData.user.id,
          email: authData.user.email,
          full_name: fullName || email.split('@')[0],
          created_at: new Date(),
          updated_at: new Date(),
          role: 'user',
          api_keys: {},
          preferences: {}
        };
        
        await create('users', newUser);
      }
      
      return res.status(201).json({ 
        message: 'Usuario registrado correctamente',
        user: authData.user
      });
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error del servidor al registrar usuario' });
    }
  },
  
  /**
   * Iniciar sesión
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validar datos de entrada
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }
      
      // Autenticar usuario
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return res.status(401).json({ error: error.message });
      }
      
      return res.status(200).json({ 
        message: 'Inicio de sesión exitoso',
        session: data.session,
        user: data.user
      });
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
    }
  },
  
  /**
   * Cerrar sesión
   */
  async logout(req, res) {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ error: 'Error del servidor al cerrar sesión' });
    }
  },
  
  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      // Obtener datos del usuario
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Ocultar información sensible
      if (data.api_keys) {
        Object.keys(data.api_keys).forEach(key => {
          data.api_keys[key] = '••••••••••••••';
        });
      }
      
      return res.status(200).json({ user: data });
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener perfil' });
    }
  },
  
  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { fullName, avatarUrl, preferences } = req.body;
      
      // Preparar datos de actualización
      const updates = {
        updated_at: new Date()
      };
      
      if (fullName) updates.full_name = fullName;
      if (avatarUrl) updates.avatar_url = avatarUrl;
      if (preferences) updates.preferences = preferences;
      
      // Actualizar usuario
      const { data, error } = await update('users', userId, updates);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Ocultar información sensible
      if (data[0].api_keys) {
        Object.keys(data[0].api_keys).forEach(key => {
          data[0].api_keys[key] = '••••••••••••••';
        });
      }
      
      return res.status(200).json({ user: data[0] });
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      return res.status(500).json({ error: 'Error del servidor al actualizar perfil' });
    }
  },
  
  /**
   * Actualizar claves API
   */
  async updateApiKeys(req, res) {
    try {
      const userId = req.user.id;
      const { claudeApiKey, chatgptApiKey } = req.body;
      
      // Obtener claves API actuales
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('api_keys')
        .eq('id', userId)
        .single();
      
      if (userError) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      // Actualizar claves API
      const apiKeys = userData.api_keys || {};
      
      if (claudeApiKey) apiKeys.claude = claudeApiKey;
      if (chatgptApiKey) apiKeys.chatgpt = chatgptApiKey;
      
      // Guardar cambios
      const { data, error } = await update('users', userId, {
        api_keys: apiKeys,
        updated_at: new Date()
      });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ 
        message: 'Claves API actualizadas correctamente',
        keys: {
          claude: claudeApiKey ? '••••••••••••••' : (apiKeys.claude ? '••••••••••••••' : null),
          chatgpt: chatgptApiKey ? '••••••••••••••' : (apiKeys.chatgpt ? '••••••••••••••' : null)
        }
      });
    } catch (err) {
      console.error('Error al actualizar claves API:', err);
      return res.status(500).json({ error: 'Error del servidor al actualizar claves API' });
    }
  }
};

// backend/src/routes/projectRoutes.js
// Rutas para operaciones de proyectos

import express from 'express';
import { projectController } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de proyectos
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;

// backend/src/routes/conversationRoutes.js
// Rutas para operaciones de conversaciones

import express from 'express';
import { conversationController } from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de conversaciones
router.get('/project/:projectId', conversationController.getConversations);
router.get('/:id', conversationController.getConversation);
router.post('/', conversationController.createConversation);
router.post('/:conversationId/message', conversationController.addMessage);
router.post('/:conversationId/builder', conversationController.generateBuilderResponse);
router.post('/:conversationId/judge', conversationController.generateJudgeEvaluation);
router.post('/:conversationId/switch-roles', conversationController.switchRoles);

export default router;

// backend/src/routes/authRoutes.js
// Rutas para autenticación y gestión de usuarios

import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rutas protegidas
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/api-keys', authMiddleware, authController.updateApiKeys);

export default router;

// backend/src/middleware/auth.js
// Middleware de autenticación

import { supabaseClient } from '../config/supabase.js';

/**
 * Middleware para verificar autenticación
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token de autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token con Supabase
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    // Añadir usuario a la solicitud
    req.user = data.user;
    
    // Continuar con la siguiente función
    next();
  } catch (err) {
    console.error('Error en middleware de autenticación:', err);
    return res.status(500).json({ error: 'Error del servidor en autenticación' });
  }
};

// backend/src/middleware/errorHandler.js
// Middleware para manejo de errores

/**
 * Middleware para manejar errores en la aplicación
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Determinar el tipo de error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ error: 'Acceso prohibido' });
  }
  
  if (err.name === 'NotFoundError') {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }
  
  // Para errores no manejados específicamente
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  return res.status(statusCode).json({ error: message });
};

// backend/src/app.js
// Aplicación principal de Express

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocketIO } from './socket/init.js';
import projectRoutes from './routes/projectRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Crear aplicación Express
const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inicializar Socket.IO
initSocketIO(io);

// Configurar middlewares
app.use(helmet()); // Seguridad
app.use(compression()); // Compresión de respuestas
app.use(express.json({ limit: '10mb' })); // Parseo de JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar CORS
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitTime,
  max: config.rateLimitRequests,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Rutas principales
app.use('/api/projects', projectRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/auth', authRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: config.environment });
});

// Middleware de manejo de errores
app.use(// backend/src/controllers/projectController.js
// Controlador para operaciones de proyectos

import { getById, create, update, remove } from '../config/supabase.js';
import { supabaseClient } from '../config/supabase.js';

/**
 * Controlador para gestionar proyectos
 */
export const projectController = {
  /**
   * Obtener todos los proyectos de un usuario
   */
  async getAllProjects(req, res) {
    try {
      const userId = req.user.id;
      
      // Consultar proyectos donde el usuario es propietario o colaborador
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
        .order('updated_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ projects: data });
    } catch (err) {
      console.error('Error al obtener proyectos:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener proyectos' });
    }
  },
  
  /**
   * Obtener un proyecto específico por ID
   */
  async getProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verificar acceso al proyecto (propietario o colaborador)
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', id)
        .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Proyecto no encontrado o sin acceso' });
      }
      
      return res.status(200).json({ project: data });
    } catch (err) {
      console.error('Error al obtener proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener el proyecto' });
    }
  },
  
  /**
   * Crear un nuevo proyecto
   */
  async createProject(req, res) {
    try {
      const { name, description, config, tags } = req.body;
      const userId = req.user.id;
      
      // Validar datos de entrada
      if (!name) {
        return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
      }
      
      // Crear nuevo proyecto
      const newProject = {
        name,
        description: description || '',
        owner_id: userId,
        collaborators: [],
        status: 'active',
        config: config || {},
        tags: tags || [],
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const { data, error } = await create('projects', newProject);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(201).json({ project: data[0] });
    } catch (err) {
      console.error('Error al crear proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al crear el proyecto' });
    }
  },
  
  /**
   * Actualizar un proyecto existente
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status, config, tags, collaborators } = req.body;
      const userId = req.user.id;
      
      // Verificar que el usuario es propietario del proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      if (projectData.owner_id !== userId) {
        return res.status(403).json({ error: 'Solo el propietario puede actualizar el proyecto' });
      }
      
      // Preparar datos de actualización
      const updates = {
        updated_at: new Date()
      };
      
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (status) updates.status = status;
      if (config) updates.config = config;
      if (tags) updates.tags = tags;
      if (collaborators) updates.collaborators = collaborators;
      
      // Actualizar proyecto
      const { data, error } = await update('projects', id, updates);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ project: data[0] });
    } catch (err) {
      console.error('Error al actualizar proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al actualizar el proyecto' });
    }
  },
  
  /**
   * Eliminar un proyecto
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verificar que el usuario es propietario del proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('owner_id')
        .eq('id', id)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      if (projectData.owner_id !== userId) {
        return res.status(403).json({ error: 'Solo el propietario puede eliminar el proyecto' });
      }
      
      // Eliminar proyecto
      const { error } = await remove('projects', id);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar proyecto:', err);
      return res.status(500).json({ error: 'Error del servidor al eliminar el proyecto' });
    }
  }
};

// backend/src/controllers/conversationController.js
// Controlador para operaciones de conversaciones

import { supabaseClient } from '../config/supabase.js';
import { create, update, getById } from '../config/supabase.js';
import { BuilderAgent } from '../langchain/agents/builder.js';
import { JudgeAgent } from '../langchain/agents/judge.js';
import { TokenService } from '../services/tokenService.js';

/**
 * Controlador para gestionar conversaciones entre agentes
 */
export const conversationController = {
  /**
   * Obtener todas las conversaciones de un proyecto
   */
  async getConversations(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      // Verificar acceso al proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, owner_id, collaborators')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = projectData.owner_id === userId || 
                         (projectData.collaborators && projectData.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso al proyecto' });
      }
      
      // Obtener conversaciones
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ conversations: data });
    } catch (err) {
      console.error('Error al obtener conversaciones:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener conversaciones' });
    }
  },
  
  /**
   * Obtener una conversación específica por ID
   */
  async getConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Obtener conversación con proyecto relacionado
      const { data: conversationData, error: conversationError } = await supabaseClient
        .from('conversations')
        .select('*, project:project_id(owner_id, collaborators)')
        .eq('id', id)
        .single();
      
      if (conversationError) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso al proyecto
      const hasAccess = conversationData.project.owner_id === userId || 
                         (conversationData.project.collaborators && 
                          conversationData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a esta conversación' });
      }
      
      // Obtener mensajes de la conversación
      const { data: messages, error: messagesError } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        return res.status(400).json({ error: messagesError.message });
      }
      
      // Combinar datos
      const result = {
        ...conversationData,
        messages: messages || []
      };
      
      return res.status(200).json({ conversation: result });
    } catch (err) {
      console.error('Error al obtener conversación:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener la conversación' });
    }
  },
  
  /**
   * Crear una nueva conversación
   */
  async createConversation(req, res) {
    try {
      const { projectId, title, builderLlm, judgeLlm } = req.body;
      const userId = req.user.id;
      
      // Verificar acceso al proyecto
      const { data: projectData, error: projectError } = await supabaseClient
        .from('projects')
        .select('id, owner_id, collaborators')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        return res.status(404).json({
