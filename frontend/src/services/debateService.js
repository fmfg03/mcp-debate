// frontend/src/services/debateService.js
import api from './apiService';

const debateService = {
  // Obtener todos los debates de un proyecto
  getDebates: async (projectId) => {
    const response = await api.get(`/debates/project/${projectId}`);
    return response.data;
  },

  // Obtener un debate específico
  getDebate: async (id) => {
    const response = await api.get(`/debates/${id}`);
    return response.data;
  },

  // Crear un nuevo debate
  createDebate: async (debateData) => {
    const response = await api.post('/debates', debateData);
    return response.data;
  },

  // Generar el siguiente turno en un debate
  generateNextTurn: async (id) => {
    const response = await api.post(`/debates/${id}/next-turn`);
    return response.data;
  },
};

export default debateService;
