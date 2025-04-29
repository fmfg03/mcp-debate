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
        return res.status(404).json({
