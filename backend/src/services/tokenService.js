// backend/src/services/tokenService.js
// Servicio para la gestión y optimización de tokens en los LLMs

/**
 * Clase para la gestión y optimización del uso de tokens
 */
export class TokenService {
  constructor() {
    // Factores de ajuste para diferentes modelos
    this.modelFactors = {
      "claude-3-7-sonnet-20250219": 1.0,
      "claude-3-opus": 1.0,
      "claude-3-5-sonnet": 1.0,
      "gpt-4o": 1.0,
      "gpt-4-turbo": 1.0
    };
    
    // Límites de tokens por modelo
    this.modelLimits = {
      "claude-3-7-sonnet-20250219": 200000,
      "claude-3-opus": 200000,
      "claude-3-5-sonnet": 200000,
      "gpt-4o": 128000,
      "gpt-4-turbo": 128000
    };
  }

  /**
   * Estima el número de tokens en un texto
   * @param {string} text - Texto para estimar tokens
   * @param {string} model - Modelo de LLM (opcional)
   * @returns {number} Número estimado de tokens
   */
  estimateTokenCount(text, model = "claude-3-7-sonnet-20250219") {
    if (!text) return 0;
    
    // Obtener el factor para el modelo específico
    const factor = this.modelFactors[model] || 1.0;
    
    // Método simple basado en la regla de 4 caracteres ~ 1 token
    // Esta es una estimación rápida, para producción se recomienda usar tokenizadores específicos
    const rawEstimate = Math.ceil(text.length / 4);
    
    // Ajustar según el modelo
    return Math.ceil(rawEstimate * factor);
  }

  /**
   * Verifica si un texto excede el límite de tokens
   * @param {string} text - Texto para verificar
   * @param {number} limit - Límite de tokens
   * @param {string} model - Modelo de LLM (opcional)
   * @returns {boolean} True si excede el límite
   */
  exceedsTokenLimit(text, limit, model = "claude-3-7-sonnet-20250219") {
    const tokenCount = this.estimateTokenCount(text, model);
    return tokenCount > limit;
  }

  /**
   * Obtiene el límite de tokens para un modelo específico
   * @param {string} model - Modelo de LLM
   * @returns {number} Límite de tokens para el modelo
   */
  getModelLimit(model) {
    return this.modelLimits[model] || 8000; // Valor predeterminado conservador
  }

  /**
   * Trunca un texto para que no exceda un límite de tokens
   * @param {string} text - Texto para truncar
   * @param {number} limit - Límite de tokens
   * @param {string} model - Modelo de LLM (opcional)
   * @returns {string} Texto truncado
   */
  truncateToTokenLimit(text, limit, model = "claude-3-7-sonnet-20250219") {
    if (!this.exceedsTokenLimit(text, limit, model)) {
      return text; // Ya está dentro del límite
    }
    
    // Estimar cuántos caracteres corresponden al límite de tokens
    const factor = this.modelFactors[model] || 1.0;
    const charLimit = Math.floor((limit / factor) * 4);
    
    // Truncar el texto
    const truncated = text.substring(0, charLimit);
    
    // Añadir indicador de truncamiento
    return truncated + "\n[Texto truncado debido a limitaciones de tokens]";
  }

  /**
   * Optimiza un conjunto de mensajes para no exceder un límite de tokens
   * @param {Array} messages - Array de mensajes {role, content}
   * @param {number} limit - Límite de tokens
   * @param {string} model - Modelo de LLM (opcional)
   * @returns {Array} Mensajes optimizados
   */
  optimizeConversation(messages, limit, model = "claude-3-7-sonnet-20250219") {
    if (!messages || messages.length === 0) return [];
    
    // Calcular tokens actuales
    let totalTokens = 0;
    for (const msg of messages) {
      totalTokens += this.estimateTokenCount(msg.content, model);
    }
    
    // Si estamos dentro del límite, devolver sin cambios
    if (totalTokens <= limit) {
      return messages;
    }
    
    // Reservar espacio para los mensajes más recientes (últimos 2)
    const recentMessages = messages.slice(-2);
    let recentTokens = 0;
    for (const msg of recentMessages) {
      recentTokens += this.estimateTokenCount(msg.content, model);
    }
    
    // Espacio disponible para mensajes anteriores
    const availableTokens = limit - recentTokens;
    
    // Espacio para el mensaje de resumen (20% del disponible)
    const summaryTokens = Math.floor(availableTokens * 0.2);
    
    // Mensajes a resumir
    const oldMessages = messages.slice(0, -2);
    
    // Generar contenido para el resumen
    let summaryContent = "Resumen de la conversación anterior:\n";
    for (const msg of oldMessages) {
      summaryContent += `- ${msg.role.toUpperCase()}: ${msg.content.substring(0, 100)}...\n`;
    }
    
    // Truncar el resumen si es necesario
    summaryContent = this.truncateToTokenLimit(summaryContent, summaryTokens, model);
    
    // Crear mensaje de resumen
    const summaryMessage = {
      role: "system",
      content: summaryContent
    };
    
    // Combinar resumen con mensajes recientes
    return [summaryMessage, ...recentMessages];
  }

  /**
   * Registra el uso de tokens para seguimiento y facturación
   * @param {string} projectId - ID del proyecto
   * @param {string} conversationId - ID de la conversación
   * @param {string} provider - Proveedor del LLM (claude/chatgpt)
   * @param {number} promptTokens - Tokens en el prompt
   * @param {number} completionTokens - Tokens en la respuesta
   * @param {string} model - Modelo específico usado
   */
  async logTokenUsage(projectId, conversationId, provider, promptTokens, completionTokens, model) {
    // En una implementación real, esto guardaría en la base de datos
    console.log(`Token usage - Project: ${projectId}, Conversation: ${conversationId}`);
    console.log(`Provider: ${provider}, Model: ${model}`);
    console.log(`Prompt tokens: ${promptTokens}, Completion tokens: ${completionTokens}`);
    console.log(`Total tokens: ${promptTokens + completionTokens}`);
    
    // Aquí se implementaría la lógica para guardar en la base de datos
    // y actualizar las estadísticas del proyecto
  }
}

// backend/src/config/env.js
// Configuración de variables de entorno

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config();

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';

// Configuraciones específicas por entorno
const envConfig = {
  development: {
    apiPort: process.env.API_PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    logLevel: process.env.LOG_LEVEL || 'debug',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    defaultClaudeModel: 'claude-3-7-sonnet-20250219',
    defaultGPTModel: 'gpt-4o',
    maxTokensPerRequest: 2000,
  },
  test: {
    apiPort: process.env.API_PORT || 3001,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    logLevel: process.env.LOG_LEVEL || 'warn',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    defaultClaudeModel: 'claude-3-7-sonnet-20250219',
    defaultGPTModel: 'gpt-4o',
    maxTokensPerRequest: 2000,
  },
  production: {
    apiPort: process.env.API_PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL,
    logLevel: process.env.LOG_LEVEL || 'info',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    defaultClaudeModel: 'claude-3-7-sonnet-20250219',
    defaultGPTModel: 'gpt-4o',
    maxTokensPerRequest: 2000,
  },
};

// Exportar la configuración para el entorno actual
export const config = {
  environment,
  ...envConfig[environment],
  
  // Valores comunes a todos los entornos
  jwtSecret: process.env.JWT_SECRET,
  sessionDuration: process.env.SESSION_DURATION || '7d',
  
  // Límites y configuraciones de la aplicación
  projectLimit: process.env.PROJECT_LIMIT || 10,
  conversationHistoryLimit: process.env.CONVERSATION_HISTORY_LIMIT || 100,
  
  // Configuraciones de seguridad
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [envConfig[environment].frontendUrl],
  rateLimitRequests: process.env.RATE_LIMIT_REQUESTS || 100,
  rateLimitTime: process.env.RATE_LIMIT_TIME || 15 * 60 * 1000, // 15 minutos por defecto
};

// backend/src/config/supabase.js
// Configuración de la conexión con Supabase

import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Verificar que las variables de entorno necesarias estén definidas
if (!config.supabaseUrl || !config.supabaseKey) {
  throw new Error('Supabase URL y Key deben estar definidas en las variables de entorno');
}

// Crear el cliente de Supabase
export const supabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Función para verificar la conexión
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient.from('test_connection').select('*').limit(1);
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return false;
    }
    
    console.log('Conexión exitosa con Supabase');
    return true;
  } catch (err) {
    console.error('Error inesperado al conectar con Supabase:', err);
    return false;
  }
}

// Helper para gestionar errores de Supabase
export function handleSupabaseError(error) {
  if (error) {
    const errorMessage = error.message || 'Error desconocido en la operación con Supabase';
    const errorCode = error.code || 'UNKNOWN_ERROR';
    
    console.error(`Error Supabase [${errorCode}]: ${errorMessage}`);
    
    // En desarrollo, mostrar detalles adicionales
    if (config.environment === 'development') {
      console.error('Detalles completos del error:', error);
    }
    
    return {
      code: errorCode,
      message: errorMessage,
      details: config.environment === 'development' ? error : undefined,
    };
  }
  
  return null;
}

// Funciones helpers para operaciones comunes

/**
 * Busca un registro por ID
 * @param {string} table - Nombre de la tabla
 * @param {string} id - ID del registro
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function getById(table, id) {
  const { data, error } = await supabaseClient
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error: handleSupabaseError(error) };
}

/**
 * Crea un nuevo registro
 * @param {string} table - Nombre de la tabla
 * @param {Object} record - Datos a insertar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function create(table, record) {
  const { data, error } = await supabaseClient
    .from(table)
    .insert(record)
    .select();
  
  return { data, error: handleSupabaseError(error) };
}

/**
 * Actualiza un registro existente
 * @param {string} table - Nombre de la tabla
 * @param {string} id - ID del registro
 * @param {Object} updates - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function update(table, id, updates) {
  const { data, error } = await supabaseClient
    .from(table)
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error: handleSupabaseError(error) };
}

/**
 * Elimina un registro
 * @param {string} table - Nombre de la tabla
 * @param {string} id - ID del registro
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function remove(table, id) {
  const { data, error } = await supabaseClient
    .from(table)
    .delete()
    .eq('id', id);
  
  return { data, error: handleSupabaseError(error) };
}
