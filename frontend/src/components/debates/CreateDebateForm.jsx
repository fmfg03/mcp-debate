// frontend/src/components/debates/CreateDebateForm.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createDebate } from '../../store/slices/debateSlice';
import { FiMessageSquare, FiX } from 'react-icons/fi';

const CreateDebateForm = ({ projectId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    agentA: 'claude',
    agentB: 'chatgpt',
    maxTurns: 4
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error al cambiar el campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.topic.trim()) {
      newErrors.topic = 'El tema es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const debateData = {
        projectId,
        title: formData.title,
        topic: formData.topic,
        agentA: formData.agentA,
        agentB: formData.agentB,
        maxTurns: parseInt(formData.maxTurns)
      };
      
      const resultAction = await dispatch(createDebate(debateData));
      
      if (createDebate.fulfilled.match(resultAction)) {
        if (onSuccess) {
          onSuccess(resultAction.payload);
        }
        
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error al crear debate:', error);
      setErrors({
        submit: error.message || 'Error al crear el debate'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-3 bg-red-100 text-red-800 rounded-md">
          {errors.submit}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Título *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
          placeholder="Título del debate"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tema del Debate *
        </label>
        <textarea
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          rows={3}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.topic ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
          placeholder="Describe el tema o pregunta para debatir"
        ></textarea>
        {errors.topic && (
          <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Primer Participante
          </label>
          <select
            name="agentA"
            value={formData.agentA}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="claude">Claude</option>
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Segundo Participante
          </label>
          <select
            name="agentB"
            value={formData.agentB}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Número de Turnos
        </label>
        <select
          name="maxTurns"
          value={formData.maxTurns}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="2">2 turnos</option>
          <option value="4">4 turnos</option>
          <option value="6">6 turnos</option>
          <option value="8">8 turnos</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Cada turno representa una participación alternada entre los agentes.
        </p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiMessageSquare className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Creando...' : 'Crear Debate'}
        </button>
      </div>
    </form>
  );
};

export default CreateDebateForm;
