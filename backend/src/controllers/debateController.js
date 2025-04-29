// backend/src/controllers/debateController.js
import { supabaseClient } from '../config/supabase.js';
import { create, update, getById } from '../config/supabase.js';
import { config } from '../config/env.js';

// Cliente de Anthropic y OpenAI (ya importados en otros controladores)
import { AnthropicClient } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

export const debateController = {
  // Crear un nuevo debate
  async createDebate(req, res) {
    try {
      const { projectId, title, topic, agentA, agentB, maxTurns } = req.body;
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
      
      // Verificar acceso
      const hasAccess = projectData.owner_id === userId || 
                        (projectData.collaborators && projectData.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso al proyecto' });
      }
      
      // Crear nuevo debate
      const newDebate = {
        project_id: projectId,
        title: title || `Debate ${new Date().toLocaleString()}`,
        topic: topic || 'Sin tema especificado',
        status: 'active',
        current_turn: 1,
        max_turns: maxTurns || 4,
        agent_a: agentA || 'claude',
        agent_b: agentB || 'chatgpt'
      };
      
      const { data, error } = await create('debates', newDebate);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(201).json({ debate: data[0] });
    } catch (err) {
      console.error('Error al crear debate:', err);
      return res.status(500).json({ error: 'Error del servidor al crear el debate' });
    }
  },
  
  // Obtener debates de un proyecto
  async getDebates(req, res) {
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
      
      // Verificar acceso
      const hasAccess = projectData.owner_id === userId || 
                       (projectData.collaborators && projectData.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso al proyecto' });
      }
      
      // Obtener debates
      const { data, error } = await supabaseClient
        .from('debates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(200).json({ debates: data });
    } catch (err) {
      console.error('Error al obtener debates:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener debates' });
    }
  },
  
  // Obtener un debate específico con sus entradas
  async getDebate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Obtener debate con proyecto relacionado
      const { data: debateData, error: debateError } = await supabaseClient
        .from('debates')
        .select('*, project:project_id(owner_id, collaborators)')
        .eq('id', id)
        .single();
      
      if (debateError) {
        return res.status(404).json({ error: 'Debate no encontrado' });
      }
      
      // Verificar acceso
      const hasAccess = debateData.project.owner_id === userId || 
                      (debateData.project.collaborators && 
                        debateData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a este debate' });
      }
      
      // Obtener entradas del debate
      const { data: entries, error: entriesError } = await supabaseClient
        .from('debate_entries')
        .select('*')
        .eq('debate_id', id)
        .order('turn_number', { ascending: true });
      
      if (entriesError) {
        return res.status(400).json({ error: entriesError.message });
      }
      
      // Combinar datos
      const result = {
        ...debateData,
        entries: entries || []
      };
      
      return res.status(200).json({ debate: result });
    } catch (err) {
      console.error('Error al obtener debate:', err);
      return res.status(500).json({ error: 'Error del servidor al obtener el debate' });
    }
  },
  
  // Generar siguiente turno del debate
  async generateNextTurn(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Obtener debate
      const { data: debateData, error: debateError } = await supabaseClient
        .from('debates')
        .select('*, project:project_id(id, owner_id, collaborators)')
        .eq('id', id)
        .single();
      
      if (debateError) {
        return res.status(404).json({ error: 'Debate no encontrado' });
      }
      
      // Verificar acceso
      const hasAccess = debateData.project.owner_id === userId || 
                      (debateData.project.collaborators && 
                        debateData.project.collaborators.includes(userId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Sin acceso a este debate' });
      }
      
      // Verificar si el debate ya terminó
      if (debateData.current_turn > debateData.max_turns) {
        return res.status(400).json({ error: 'Este debate ya ha terminado' });
      }
      
      // Obtener entradas anteriores
      const { data: previousEntries, error: entriesError } = await supabaseClient
        .from('debate_entries')
        .select('*')
        .eq('debate_id', id)
        .order('turn_number', { ascending: true });
      
      if (entriesError) {
        return res.status(400).json({ error: entriesError.message });
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
      
      // Determinar qué agente le toca
      const currentTurn = debateData.current_turn;
      let currentAgent;
      
      if (currentTurn % 2 === 1) {
        // Turnos impares para agentA
        currentAgent = debateData.agent_a;
      } else {
        // Turnos pares para agentB
        currentAgent = debateData.agent_b;
      }
      
      // Verificar que existen las claves necesarias
      if (!apiKeys[currentAgent]) {
        return res.status(400).json({ error: `Clave API no configurada para ${currentAgent}` });
      }
      
      // Construir prompt para el agente actual
      let prompt = '';
      const topic = debateData.topic;
      
      // Para el primer turno
      if (currentTurn === 1) {
        prompt = `Estás participando en un debate sobre el tema: "${topic}".
Este es el primer turno del debate. Por favor, presentar una postura inicial o perspectiva sobre este tema.
Tu respuesta debe ser detallada, articulada y abierta a la discusión. Evita ser demasiado conclusivo, ya que este es el inicio de un debate.`;
      } 
      // Para el último turno
      else if (currentTurn === debateData.max_turns) {
        prompt = `Estamos en el turno final (${currentTurn} de ${debateData.max_turns}) del debate sobre: "${topic}".
A continuación está el historial del debate:

${previousEntries.map(e => `[Turno ${e.turn_number}] ${e.agent.toUpperCase()}: ${e.content.substring(0, 300)}...`).join('\n\n')}

Por favor, proporciona una conclusión o postura final sobre este tema, considerando todos los puntos discutidos anteriormente.
Tu respuesta debe resumir los principales argumentos y ofrecer una síntesis o posición concluyente.`;
      } 
      // Para turnos intermedios
      else {
        prompt = `Estamos en el turno ${currentTurn} de ${debateData.max_turns} del debate sobre: "${topic}".
A continuación está el historial del debate:

${previousEntries.map(e => `[Turno ${e.turn_number}] ${e.agent.toUpperCase()}: ${e.content.substring(0, 300)}...`).join('\n\n')}

Por favor, continúa el debate respondiendo a los puntos anteriores. Puedes refutar, expandir o introducir nuevas perspectivas.
Tu respuesta debe ser reflexiva y provocar más discusión.`;
      }
      
      // Generar respuesta del LLM
      let response;
      
      if (currentAgent === 'claude') {
        const anthropicClient = new AnthropicClient(apiKeys.claude);
        
        const message = await anthropicClient.messages.create({
          model: config.defaultClaudeModel,
          max_tokens: 2000,
          temperature: 0.7,
          system: "Eres un experto en debates y discusiones. Tu objetivo es explorar ideas, contemplar diferentes perspectivas y profundizar en el tema en discusión.",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });
        
        response = {
          content: message.content[0].text,
          model: message.model,
          promptTokens: message.usage.input_tokens,
          completionTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        };
      } else {
        // ChatGPT
        const openaiClient = new OpenAI({ apiKey: apiKeys.chatgpt });
        
        const completion = await openaiClient.chat.completions.create({
          model: config.defaultGPTModel,
          messages: [
            {
              role: "system",
              content: "Eres un experto en debates y discusiones. Tu objetivo es explorar ideas, contemplar diferentes perspectivas y profundizar en el tema en discusión.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        });
        
        response = {
          content: completion.choices[0].message.content,
          model: completion.model,
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        };
      }
      
      // Crear nueva entrada de debate
      const newEntry = {
        debate_id: id,
        agent: currentAgent,
        turn_number: currentTurn,
        content: response.content,
        token_count: response.totalTokens,
        metadata: {
          model: response.model,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens
        }
      };
      
      const { data: entryData, error: entryError } = await create('debate_entries', newEntry);
      
      if (entryError) {
        return res.status(400).json({ error: entryError.message });
      }
      
      // Actualizar turno actual del debate
      await update('debates', id, {
        current_turn: currentTurn + 1,
        updated_at: new Date()
      });
      
      // Verificar si el debate ha terminado
      const isCompleted = currentTurn + 1 > debateData.max_turns;
      if (isCompleted) {
        await update('debates', id, {
          status: 'completed'
        });
      }
      
      return res.status(200).json({ 
        entry: entryData[0],
        isCompleted
      });
    } catch (err) {
      console.error('Error al generar turno de debate:', err);
      return res.status(500).json({ error: 'Error del servidor al generar turno de debate' });
    }
  }
};
