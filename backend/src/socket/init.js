// backend/src/socket/init.js
// Inicialización y configuración de Socket.io

import { supabaseClient } from '../config/supabase.js';
import { conversationController } from '../controllers/conversationController.js';

/**
 * Inicializa y configura Socket.io
 * @param {Object} io - Instancia de Socket.io
 */
export function initSocketIO(io) {
  // Middleware para autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No se proporcionó token de autenticación'));
      }
      
      // Verificar token con Supabase
      const { data, error } = await supabaseClient.auth.getUser(token);
      
      if (error || !data.user) {
        return next(new Error('Token inválido o expirado'));
      }
      
      // Adjuntar usuario al socket
      socket.user = data.user;
      next();
    } catch (err) {
      console.error('Error en autenticación de socket:', err);
      next(new Error('Error de autenticación'));
    }
  });

  // Manejar conexiones
  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.user.id}`);
    
    // Unirse a sala de usuario
    socket.join(`user:${socket.user.id}`);
    
    // Unirse a salas de proyectos
    handleJoinProjects(socket);
    
    // Manejar eventos
    registerEventHandlers(socket);
    
    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.id}`);
    });
  });
}

/**
 * Unir al usuario a las salas de sus proyectos
 * @param {Object} socket - Socket del cliente
 */
async function handleJoinProjects(socket) {
  try {
    const userId = socket.user.id;
    
    // Obtener proyectos del usuario
    const { data, error } = await supabaseClient
      .from('projects')
      .select('id')
      .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`);
    
    if (error) {
      console.error('Error al obtener proyectos para socket:', error);
      return;
    }
    
    // Unirse a cada sala de proyecto
    data.forEach(project => {
      socket.join(`project:${project.id}`);
    });
    
    console.log(`Usuario ${userId} unido a ${data.length} salas de proyectos`);
  } catch (err) {
    console.error('Error al unir a salas de proyectos:', err);
  }
}

/**
 * Registrar manejadores de eventos para el socket
 * @param {Object} socket - Socket del cliente
 */
function registerEventHandlers(socket) {
  // Unirse a una conversación
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`Usuario ${socket.user.id} unido a conversación ${conversationId}`);
  });
  
  // Salir de una conversación
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`Usuario ${socket.user.id} salió de conversación ${conversationId}`);
  });
  
  // Enviar mensaje de usuario
  socket.on('send_user_message', async (data) => {
    try {
      const { conversationId, content } = data;
      
      if (!conversationId || !content) {
        socket.emit('error', { message: 'Datos incompletos' });
        return;
      }
      
      // Crear mensaje a través del controlador
      const req = {
        params: { conversationId },
        body: { role: 'user', content, llmProvider: null },
        user: socket.user
      };
      
      const res = {
        status: (code) => ({
          json: (data) => {
            if (code >= 200 && code < 300) {
              // Emitir mensaje a todos en la sala de conversación
              io.to(`conversation:${conversationId}`).emit('new_message', data.message);
              return data;
            } else {
              socket.emit('error', data);
              return data;
            }
          }
        })
      };
      
      await conversationController.addMessage(req, res);
    } catch (err) {
      console.error('Error al procesar mensaje de usuario:', err);
      socket.emit('error', { message: 'Error al procesar mensaje' });
    }
  });
  
  // Solicitar respuesta del Builder
  socket.on('request_builder_response', async (data) => {
    try {
      const { conversationId, requirements } = data;
      
      if (!conversationId) {
        socket.emit('error', { message: 'ID de conversación requerido' });
        return;
      }
      
      // Notificar que el Builder está trabajando
      io.to(`conversation:${conversationId}`).emit('builder_thinking', { 
        conversationId, 
        timestamp: new Date() 
      });
      
      // Generar respuesta a través del controlador
      const req = {
        params: { conversationId },
        body: { requirements },
        user: socket.user
      };
      
      const res = {
        status: (code) => ({
          json: (data) => {
            if (code >= 200 && code < 300) {
              // Emitir respuesta a todos en la sala de conversación
              io.to(`conversation:${conversationId}`).emit('new_message', data.message);
              io.to(`conversation:${conversationId}`).emit('builder_completed', { 
                conversationId, 
                messageId: data.message.id
              });
              return data;
            } else {
              socket.emit('error', data);
              io.to(`conversation:${conversationId}`).emit('builder_error', { 
                conversationId,
                error: data.error
              });
              return data;
            }
          }
        })
      };
      
      await conversationController.generateBuilderResponse(req, res);
    } catch (err) {
      console.error('Error al generar respuesta del Builder:', err);
      socket.emit('error', { message: 'Error al generar respuesta del Builder' });
      io.to(`conversation:${data.conversationId}`).emit('builder_error', { 
        conversationId: data.conversationId,
        error: 'Error interno al generar respuesta'
      });
    }
  });
  
  // Solicitar evaluación del Judge
  socket.on('request_judge_evaluation', async (data) => {
    try {
      const { conversationId, builderMessageId, requirements } = data;
      
      if (!conversationId) {
        socket.emit('error', { message: 'ID de conversación requerido' });
        return;
      }
      
      // Notificar que el Judge está trabajando
      io.to(`conversation:${conversationId}`).emit('judge_thinking', { 
        conversationId, 
        timestamp: new Date() 
      });
      
      // Generar evaluación a través del controlador
      const req = {
        params: { conversationId },
        body: { builderMessageId, requirements },
        user: socket.user
      };
      
      const res = {
        status: (code) => ({
          json: (data) => {
            if (code >= 200 && code < 300) {
              // Emitir evaluación a todos en la sala de conversación
              io.to(`conversation:${conversationId}`).emit('new_message', data.message);
              io.to(`conversation:${conversationId}`).emit('judge_completed', { 
                conversationId, 
                messageId: data.message.id,
                score: data.message.metadata?.score
              });
              return data;
            } else {
              socket.emit('error', data);
              io.to(`conversation:${conversationId}`).emit('judge_error', { 
                conversationId,
                error: data.error
              });
              return data;
            }
          }
        })
      };
      
      await conversationController.generateJudgeEvaluation(req, res);
    } catch (err) {
      console.error('Error al generar evaluación del Judge:', err);
      socket.emit('error', { message: 'Error al generar evaluación del Judge' });
      io.to(`conversation:${data.conversationId}`).emit('judge_error', { 
        conversationId: data.conversationId,
        error: 'Error interno al generar evaluación'
      });
    }
  });
  
  // Cambiar roles de los agentes
  socket.on('switch_roles', async (data) => {
    try {
      const { conversationId } = data;
      
      if (!conversationId) {
        socket.emit('error', { message: 'ID de conversación requerido' });
        return;
      }
      
      // Cambiar roles a través del controlador
      const req = {
        params: { conversationId },
        body: {},
        user: socket.user
      };
      
      const res = {
        status: (code) => ({
          json: (data) => {
            if (code >= 200 && code < 300) {
              // Notificar cambio de roles a todos en la sala
              io.to(`conversation:${conversationId}`).emit('roles_switched', { 
                conversationId,
                builder_llm: data.conversation.builder_llm,
                judge_llm: data.conversation.judge_llm
              });
              return data;
            } else {
              socket.emit('error', data);
              return data;
            }
          }
        })
      };
      
      await conversationController.switchRoles(req, res);
    } catch (err) {
      console.error('Error al cambiar roles:', err);
      socket.emit('error', { message: 'Error al cambiar roles' });
    }
  });
}

// backend/src/socket/events.js
// Definición de eventos de Socket.io

/**
 * Enumera los eventos disponibles en la aplicación
 */
export const SocketEvents = {
  // Eventos del cliente al servidor
  CLIENT: {
    JOIN_CONVERSATION: 'join_conversation',
    LEAVE_CONVERSATION: 'leave_conversation',
    SEND_USER_MESSAGE: 'send_user_message',
    REQUEST_BUILDER_RESPONSE: 'request_builder_response',
    REQUEST_JUDGE_EVALUATION: 'request_judge_evaluation',
    SWITCH_ROLES: 'switch_roles'
  },
  
  // Eventos del servidor al cliente
  SERVER: {
    NEW_MESSAGE: 'new_message',
    BUILDER_THINKING: 'builder_thinking',
    BUILDER_COMPLETED: 'builder_completed',
    BUILDER_ERROR: 'builder_error',
    JUDGE_THINKING: 'judge_thinking',
    JUDGE_COMPLETED: 'judge_completed',
    JUDGE_ERROR: 'judge_error',
    ROLES_SWITCHED: 'roles_switched',
    ERROR: 'error'
  }
};

/**
 * Emite un evento a todos los clientes en una sala
 * @param {Object} io - Instancia de Socket.io
 * @param {string} room - Nombre de la sala
 * @param {string} eventName - Nombre del evento
 * @param {any} data - Datos a enviar
 */
export function emitToRoom(io, room, eventName, data) {
  io.to(room).emit(eventName, data);
}

/**
 * Emite un evento a un cliente específico
 * @param {Object} socket - Socket del cliente
 * @param {string} eventName - Nombre del evento
 * @param {any} data - Datos a enviar
 */
export function emitToClient(socket, eventName, data) {
  socket.emit(eventName, data);
}

/**
 * Emite un evento a todos los clientes excepto al emisor
 * @param {Object} socket - Socket del cliente emisor
 * @param {string} room - Nombre de la sala
 * @param {string} eventName - Nombre del evento
 * @param {any} data - Datos a enviar
 */
export function emitToOthers(socket, room, eventName, data) {
  socket.to(room).emit(eventName, data);
}
