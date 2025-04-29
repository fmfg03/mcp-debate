// backend/src/langchain/providers/index.js
// Integración con las APIs de Claude y ChatGPT

import { AnthropicClient } from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { config } from "../../config/env.js";

/**
 * Factory para crear clientes de LLM basados en las claves API proporcionadas
 */
export class LLMProviderFactory {
  /**
   * Crea un cliente de LLM basado en el proveedor especificado
   * @param {string} provider - 'claude' o 'chatgpt'
   * @param {string} apiKey - Clave API para el proveedor
   * @returns {Object} Cliente para el LLM especificado
   */
  static createProvider(provider, apiKey) {
    switch (provider.toLowerCase()) {
      case "claude":
        return new ClaudeProvider(apiKey);
      case "chatgpt":
        return new ChatGPTProvider(apiKey);
      default:
        throw new Error(`Proveedor LLM no soportado: ${provider}`);
    }
  }
}

/**
 * Clase base para todos los proveedores de LLM
 */
class BaseLLMProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.initialize();
  }

  initialize() {
    throw new Error("Método initialize() debe ser implementado por las subclases");
  }

  async generateResponse(prompt, options = {}) {
    throw new Error("Método generateResponse() debe ser implementado por las subclases");
  }

  estimateTokens(text) {
    // Estimación simple: aproximadamente 4 caracteres por token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Proveedor para Claude (Anthropic)
 */
class ClaudeProvider extends BaseLLMProvider {
  initialize() {
    this.client = new AnthropicClient(this.apiKey);
  }

  /**
   * Genera una respuesta usando la API de Claude
   * @param {string} prompt - El prompt para enviar a Claude
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - La respuesta generada y metadatos
   */
  async generateResponse(prompt, options = {}) {
    const defaultOptions = {
      model: "claude-3-7-sonnet-20250219", // Modelo más reciente
      max_tokens: 2000,
      temperature: 0.7,
      system: "", // System prompt personalizable
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const { model, max_tokens, temperature, system } = mergedOptions;

    try {
      const startTime = Date.now();
      
      const message = await this.client.messages.create({
        model,
        max_tokens,
        temperature,
        system,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        content: message.content[0].text,
        model: message.model,
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        responseTime,
        provider: "claude",
      };
    } catch (error) {
      console.error("Error al llamar a la API de Claude:", error);
      throw new Error(`Error de Claude: ${error.message}`);
    }
  }
}

/**
 * Proveedor para ChatGPT (OpenAI)
 */
class ChatGPTProvider extends BaseLLMProvider {
  initialize() {
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  /**
   * Genera una respuesta usando la API de ChatGPT
   * @param {string} prompt - El prompt para enviar a ChatGPT
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - La respuesta generada y metadatos
   */
  async generateResponse(prompt, options = {}) {
    const defaultOptions = {
      model: "gpt-4o", // Modelo más reciente
      max_tokens: 2000,
      temperature: 0.7,
      system: "", // System prompt personalizable
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const { model, max_tokens, temperature, system } = mergedOptions;

    try {
      const startTime = Date.now();
      
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: system || "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens,
        temperature,
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        content: completion.choices[0].message.content,
        model: completion.model,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
        responseTime,
        provider: "chatgpt",
      };
    } catch (error) {
      console.error("Error al llamar a la API de ChatGPT:", error);
      throw new Error(`Error de ChatGPT: ${error.message}`);
    }
  }
}

// backend/src/langchain/agents/builder.js
// Implementación del agente Builder

import { LLMProviderFactory } from "../providers/index.js";
import { ProjectService } from "../../services/projectService.js";
import { TokenService } from "../../services/tokenService.js";

export class BuilderAgent {
  /**
   * Constructor para el agente Builder
   * @param {string} provider - Proveedor de LLM ('claude' o 'chatgpt')
   * @param {string} apiKey - Clave API para el proveedor
   * @param {Object} options - Opciones adicionales
   */
  constructor(provider, apiKey, options = {}) {
    this.llmProvider = LLMProviderFactory.createProvider(provider, apiKey);
    this.projectService = new ProjectService();
    this.tokenService = new TokenService();
    this.options = {
      temperature: 0.7,
      maxTokens: 2000,
      ...options,
    };
    this.systemPrompt = this.getBuilderSystemPrompt();
  }

  /**
   * Define el prompt del sistema para el rol de Builder
   * @returns {string} Prompt del sistema
   */
  getBuilderSystemPrompt() {
    return `Eres un desarrollador web experto trabajando como "Builder" en el MCP System. 
Tu tarea es crear código para sitios web basados en los requisitos proporcionados.
Tus respuestas deben incluir código limpio, bien estructurado y documentado.
Debes explicar tu enfoque y las decisiones técnicas que tomas.
Tu código debe seguir las mejores prácticas de desarrollo web moderno.
Responderás a las evaluaciones y sugerencias del "Judge" de manera constructiva.`;
  }

  /**
   * Genera una respuesta basada en los requisitos del proyecto y la conversación previa
   * @param {string} projectId - ID del proyecto
   * @param {string} requirements - Requisitos del proyecto
   * @param {Array} conversationHistory - Historial de conversación
   * @returns {Promise<Object>} Respuesta generada y metadatos
   */
  async generateResponse(projectId, requirements, conversationHistory = []) {
    // Obtener datos del proyecto
    const project = await this.projectService.getProject(projectId);
    
    // Construir el prompt completo
    const prompt = this.buildPrompt(project, requirements, conversationHistory);
    
    // Estimar tokens para verificar límites
    const estimatedTokens = this.tokenService.estimateTokenCount(prompt);
    if (estimatedTokens > this.options.maxTokens * 0.8) {
      // Si excede el 80% del límite, resumir la historia de conversación
      const summarizedHistory = await this.summarizeConversationHistory(conversationHistory);
      const updatedPrompt = this.buildPrompt(project, requirements, summarizedHistory);
      return this.llmProvider.generateResponse(updatedPrompt, {
        max_tokens: this.options.maxTokens,
        temperature: this.options.temperature,
        system: this.systemPrompt,
      });
    }
    
    // Generar respuesta
    return this.llmProvider.generateResponse(prompt, {
      max_tokens: this.options.maxTokens,
      temperature: this.options.temperature,
      system: this.systemPrompt,
    });
  }

  /**
   * Construye el prompt completo para el Builder
   * @param {Object} project - Datos del proyecto
   * @param {string} requirements - Requisitos del proyecto
   * @param {Array} conversationHistory - Historial de conversación
   * @returns {string} Prompt completo
   */
  buildPrompt(project, requirements, conversationHistory) {
    // Formatear el historial de conversación
    const formattedHistory = conversationHistory.map((message) => {
      return `${message.role.toUpperCase()}: ${message.content}`;
    }).join("\n\n");

    // Construir el prompt completo
    return `
PROYECTO: ${project.name}
DESCRIPCIÓN: ${project.description}

REQUISITOS DEL USUARIO:
${requirements}

${conversationHistory.length > 0 ? `HISTORIAL DE CONVERSACIÓN:
${formattedHistory}` : ""}

Como Builder, genera código para implementar los requisitos especificados. 
Explica tu enfoque y decisiones técnicas. Asegúrate de que tu código sea claro, eficiente y bien documentado.
`;
  }

  /**
   * Resume el historial de conversación cuando es demasiado largo
   * @param {Array} conversationHistory - Historial completo de conversación
   * @returns {Promise<Array>} Historial resumido
   */
  async summarizeConversationHistory(conversationHistory) {
    if (conversationHistory.length <= 4) {
      return conversationHistory; // No resumir si es corta
    }
    
    // Mantener los últimos 2 mensajes tal cual
    const recentMessages = conversationHistory.slice(-2);
    
    // Resumir mensajes anteriores
    const messagesForSummary = conversationHistory.slice(0, -2);
    
    // Construir prompt para resumir
    const summaryPrompt = `
Resumir la siguiente conversación entre un Builder y un Judge en el contexto de desarrollo web.
Enfócate en las evaluaciones clave, los problemas identificados y las sugerencias realizadas:

${messagesForSummary.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}
`;

    // Usar el mismo LLM para generar el resumen
    const summaryResponse = await this.llmProvider.generateResponse(summaryPrompt, {
      max_tokens: 500,
      temperature: 0.3,
    });
    
    // Crear un mensaje resumen y combinarlo con los mensajes recientes
    const summaryMessage = {
      role: "system",
      content: `RESUMEN DE CONVERSACIÓN PREVIA: ${summaryResponse.content}`,
    };
    
    return [summaryMessage, ...recentMessages];
  }
  
  /**
   * Extrae la puntuación de la evaluación
   * @param {string} evaluationText - Texto completo de la evaluación
   * @returns {number} Puntuación de 1-10, o null si no se encuentra
   */
  extractScore(evaluationText) {
    // Patrón para detectar puntuaciones en diversos formatos:
    // "Puntuación: 7/10", "Puntuación final: 8", "le doy un 6 de 10", etc.
    const scorePatterns = [
      /puntuaci[oó]n\s*:?\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*de\s*)?\s*10/i,
      /evaluaci[oó]n\s*:?\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*de\s*)?\s*10/i,
      /calificaci[oó]n\s*:?\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*de\s*)?\s*10/i,
      /otorgo un\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*de\s*)?\s*10/i,
      /asigno un\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*de\s*)?\s*10/i
    ];
    
    // Buscar coincidencias en el texto
    for (const pattern of scorePatterns) {
      const match = evaluationText.match(pattern);
      if (match && match[1]) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 10) {
          return score;
        }
      }
    }
    
    // Si no se encuentra un patrón claro, intentar un enfoque más general
    const numberPattern = /\b(\d+(?:\.\d+)?)\s*\/\s*10\b/;
    const match = evaluationText.match(numberPattern);
    if (match && match[1]) {
      const score = parseFloat(match[1]);
      if (score >= 0 && score <= 10) {
        return score;
      }
    }
    
    return null; // No se encontró una puntuación válida
  }
}versationHistory(conversationHistory) {
    if (conversationHistory.length <= 4) {
      return conversationHistory; // No resumir si es corta
    }
    
    // Mantener los últimos 2 mensajes tal cual
    const recentMessages = conversationHistory.slice(-2);
    
    // Resumir mensajes anteriores
    const messagesForSummary = conversationHistory.slice(0, -2);
    
    // Construir prompt para resumir
    const summaryPrompt = `
Resumir la siguiente conversación entre un Builder y un Judge en el contexto de desarrollo web.
Mantén los puntos clave, decisiones técnicas y críticas importantes:

${messagesForSummary.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}
`;

    // Usar el mismo LLM para generar el resumen
    const summaryResponse = await this.llmProvider.generateResponse(summaryPrompt, {
      max_tokens: 500,
      temperature: 0.3,
    });
    
    // Crear un mensaje resumen y combinarlo con los mensajes recientes
    const summaryMessage = {
      role: "system",
      content: `RESUMEN DE CONVERSACIÓN PREVIA: ${summaryResponse.content}`,
    };
    
    return [summaryMessage, ...recentMessages];
  }
}

// backend/src/langchain/agents/judge.js
// Implementación del agente Judge

import { LLMProviderFactory } from "../providers/index.js";
import { ProjectService } from "../../services/projectService.js";
import { TokenService } from "../../services/tokenService.js";

export class JudgeAgent {
  /**
   * Constructor para el agente Judge
   * @param {string} provider - Proveedor de LLM ('claude' o 'chatgpt')
   * @param {string} apiKey - Clave API para el proveedor
   * @param {Object} options - Opciones adicionales
   */
  constructor(provider, apiKey, options = {}) {
    this.llmProvider = LLMProviderFactory.createProvider(provider, apiKey);
    this.projectService = new ProjectService();
    this.tokenService = new TokenService();
    this.options = {
      temperature: 0.5, // Temperatura más baja para evaluaciones más consistentes
      maxTokens: 2000,
      ...options,
    };
    this.systemPrompt = this.getJudgeSystemPrompt();
  }

  /**
   * Define el prompt del sistema para el rol de Judge
   * @returns {string} Prompt del sistema
   */
  getJudgeSystemPrompt() {
    return `Eres un evaluador experto trabajando como "Judge" en el MCP System. 
Tu tarea es evaluar críticamente el código y diseño propuesto por el Builder para sitios web.
Debes analizar el código en términos de funcionalidad, calidad, usabilidad, rendimiento y seguridad.
Proporciona críticas constructivas y sugerencias específicas y accionables.
Asigna una puntuación de 1-10 basada en criterios objetivos.
Sé justo pero exigente, con altos estándares de calidad.`;
  }

  /**
   * Genera una evaluación basada en la respuesta del Builder
   * @param {string} projectId - ID del proyecto
   * @param {string} requirements - Requisitos del proyecto
   * @param {string} builderResponse - Respuesta del Builder a evaluar
   * @param {Array} conversationHistory - Historial de conversación
   * @returns {Promise<Object>} Evaluación generada y metadatos
   */
  async generateEvaluation(projectId, requirements, builderResponse, conversationHistory = []) {
    // Obtener datos del proyecto
    const project = await this.projectService.getProject(projectId);
    
    // Construir el prompt completo
    const prompt = this.buildPrompt(project, requirements, builderResponse, conversationHistory);
    
    // Estimar tokens para verificar límites
    const estimatedTokens = this.tokenService.estimateTokenCount(prompt);
    if (estimatedTokens > this.options.maxTokens * 0.8) {
      // Si excede el 80% del límite, resumir la historia de conversación
      const summarizedHistory = await this.summarizeConversationHistory(conversationHistory);
      const updatedPrompt = this.buildPrompt(project, requirements, builderResponse, summarizedHistory);
      return this.llmProvider.generateResponse(updatedPrompt, {
        max_tokens: this.options.maxTokens,
        temperature: this.options.temperature,
        system: this.systemPrompt,
      });
    }
    
    // Generar evaluación
    return this.llmProvider.generateResponse(prompt, {
      max_tokens: this.options.maxTokens,
      temperature: this.options.temperature,
      system: this.systemPrompt,
    });
  }

  /**
   * Construye el prompt completo para el Judge
   * @param {Object} project - Datos del proyecto
   * @param {string} requirements - Requisitos del proyecto
   * @param {string} builderResponse - Respuesta del Builder a evaluar
   * @param {Array} conversationHistory - Historial de conversación
   * @returns {string} Prompt completo
   */
  buildPrompt(project, requirements, builderResponse, conversationHistory) {
    // Formatear el historial de conversación relevante (excluyendo la última respuesta del Builder)
    const formattedHistory = conversationHistory.slice(0, -1).map((message) => {
      return `${message.role.toUpperCase()}: ${message.content}`;
    }).join("\n\n");

    // Construir el prompt completo
    return `
PROYECTO: ${project.name}
DESCRIPCIÓN: ${project.description}

REQUISITOS DEL USUARIO:
${requirements}

${conversationHistory.length > 1 ? `HISTORIAL DE CONVERSACIÓN PREVIA:
${formattedHistory}` : ""}

PROPUESTA DEL BUILDER:
${builderResponse}

CRITERIOS DE EVALUACIÓN:
- Funcionalidad (¿Cumple todos los requisitos?)
- Calidad del código (¿Es limpio, legible y bien estructurado?)
- Usabilidad (¿Es intuitivo y fácil de usar?)
- Rendimiento (¿Es eficiente y escalable?)
- Seguridad (¿Implementa buenas prácticas de seguridad?)

Como Judge, evalúa la solución propuesta por el Builder. Proporciona una evaluación detallada,
identificando puntos fuertes y áreas de mejora. Ofrece sugerencias específicas y accionables.
Asigna una puntuación de 1-10 y justifica tu evaluación.
`;
  }

  /**
   * Resume el historial de conversación cuando es demasiado largo
   * @param {Array} conversationHistory - Historial completo de conversación
   * @returns {Promise<Array>} Historial resumido
   */
  async summarizeCon
