// frontend/src/components/layout/Navbar.jsx
// Barra de navegación principal

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FiHome, FiFolder, FiSettings, FiSearch, FiBell, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-blue-600 dark:text-blue-400">
                MCP System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 dark:border-blue-400 text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <FiHome className="mr-1" />
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300"
              >
                <FiFolder className="mr-1" />
                Proyectos
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300"
              >
                <FiSettings className="mr-1" />
                Configuración
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Buscar</span>
                <FiSearch className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Notificaciones</span>
                <FiBell className="h-6 w-6" />
              </button>
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// frontend/src/components/projects/ProjectCard.jsx
// Tarjeta para mostrar información resumida de un proyecto

import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArchive, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ProjectCard = ({ project, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'archived':
        return 'Archivado';
      case 'completed':
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {project.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {project.description}
            </p>
          </div>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
              project.status
            )}`}
          >
            {getStatusText(project.status)}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Última actividad
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
              {formatDate(project.updated_at)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Builder/Judge
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
              {project.config?.builder_llm || 'Claude'}/{project.config?.judge_llm || 'ChatGPT'}
            </dd>
          </div>
        </div>
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="flex justify-between">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
          >
            <FiExternalLink className="mr-1" />
            Abrir
          </Link>
          <div className="flex space-x-3">
            <Link
              to={`/projects/${project.id}/edit`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiEdit2 />
            </Link>
            <button
              onClick={() => onDelete(project.id)}
              className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <FiTrash2 />
            </button>
            <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <FiArchive />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

// frontend/src/components/conversation/ConversationPanel.jsx
// Panel principal de conversación entre agentes

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, requestBuilderResponse, requestJudgeEvaluation, switchRoles } from '../../store/slices/conversationSlice';
import MessageItem from './MessageItem';
import { FiSend, FiRefreshCw } from 'react-icons/fi';

const ConversationPanel = ({ conversationId }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  
  const { currentConversation, messages, isLoading } = useSelector((state) => state.conversation);
  
  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    dispatch(sendMessage({
      conversationId,
      content: input
    }));
    
    setInput('');
  };
  
  const handleRequestBuilder = () => {
    dispatch(requestBuilderResponse({
      conversationId
    }));
  };
  
  const handleRequestJudge = () => {
    dispatch(requestJudgeEvaluation({
      conversationId
    }));
  };
  
  const handleSwitchRoles = () => {
    dispatch(switchRoles({
      conversationId
    }));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentConversation?.title || 'Conversación'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleRequestBuilder}
              disabled={isLoading}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Builder
            </button>
            <button
              onClick={handleRequestJudge}
              disabled={isLoading}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Judge
            </button>
            <button
              onClick={handleSwitchRoles}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FiRefreshCw className="mr-1" />
              Cambiar
            </button>
          </div>
        </div>
        <div className="mt-2 flex text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            Builder: <span className="font-medium text-gray-900 dark:text-white">{currentConversation?.builder_llm || 'Claude'}</span>
          </div>
          <div className="mx-2 text-gray-300 dark:text-gray-600">|</div>
          <div className="text-gray-500 dark:text-gray-400">
            Judge: <span className="font-medium text-gray-900 dark:text-white">{currentConversation?.judge_llm || 'ChatGPT'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              No hay mensajes. Comienza la conversación...
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              builderLlm={currentConversation?.builder_llm}
              judgeLlm={currentConversation?.judge_llm}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Escribe tu mensaje..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <FiSend className="mr-1" />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPanel;

// frontend/src/components/conversation/MessageItem.jsx
// Item individual de mensaje en la conversación

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiUser, FiCpu, FiAward, FiInfo } from 'react-icons/fi';

const MessageItem = ({ message, builderLlm, judgeLlm }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determinar estilo y avatar según el rol
  const getMessageStyle = () => {
    switch (message.role) {
      case 'user':
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
      case 'builder':
        return 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-800';
      case 'judge':
        return 'bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-800';
      case 'system':
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };
  
  const getRoleIcon = () => {
    switch (message.role) {
      case 'user':
        return <FiUser className="h-6 w-6 text-blue-500 dark:text-blue-400" />;
      case 'builder':
        return <FiCpu className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
      case 'judge':
        return <FiAward className="h-6 w-6 text-amber-500 dark:text-amber-400" />;
      case 'system':
        return <FiInfo className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
      default:
        return <FiInfo className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
    }
  };
  
  const getRoleTitle = () => {
    switch (message.role) {
      case 'user':
        return 'Usuario';
      case 'builder':
        return `Builder (${builderLlm || 'LLM'})`;
      case 'judge':
        return `Judge (${judgeLlm || 'LLM'})`;
      case 'system':
        return 'Sistema';
      default:
        return message.role;
    }
  };
  
  // Renderizar bloques de código
  const renderContentWithCodeBlocks = (content) => {
    // Expresión regular para encontrar bloques de código con o sin especificación de lenguaje
    const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;
    
    // Dividir el contenido en partes de texto y código
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Añadir texto antes del bloque de código
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Añadir el bloque de código
      const language = match[1].trim() || 'javascript'; // Lenguaje por defecto
      parts.push({
        type: 'code',
        language,
        content: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Añadir texto restante después del último bloque de código
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    // Si no se encontró ninguna coincidencia, añadir todo el contenido como texto
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content
      });
    }
    
    // Renderizar las partes
    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className="my-3">
            <SyntaxHighlighter
              language={part.language}
              style={vscDarkPlus}
              className="rounded-md text-sm"
            >
              {part.content}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        // Transformar saltos de línea en <br> para el texto normal
        const textWithLineBreaks = part.content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < part.content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
        
        return <div key={index} className="whitespace-pre-line">{textWithLineBreaks}</div>;
      }
    });
  };
  
  // Formatear la fecha
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };
  
  // Renderizar puntuación del Judge
  const renderJudgeScore = () => {
    if (message.role !== 'judge' || !message.metadata || !message.metadata.score) {
      return null;
    }
    
    const score = message.metadata.score;
    let scoreColor;
    
    if (score >= 8) {
      scoreColor = 'text-green-600 dark:text-green-400';
    } else if (score >= 5) {
      scoreColor = 'text-amber-600 dark:text-amber-400';
    } else {
      scoreColor = 'text-red-600 dark:text-red-400';
    }
    
    return (
      <span className={`ml-2 font-bold ${scoreColor}`}>
        {score}/10
      </span>
    );
  };
  
  // Obtener contenido completo o truncado
  const getDisplayContent = () => {
    if (expanded || message.content.length < 500) {
      return message.content;
    }
    return message.content.substring(0, 500) + '...';
  };
  
  return (
    <div className={`p-4 rounded-lg border ${getMessageStyle()}`}>
      <div className="flex items-center mb-2">
        <div className="flex-shrink-0 mr-3">
          {getRoleIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {getRoleTitle()}
            {renderJudgeScore()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(message.created_at)}
          </p>
        </div>
      </div>
      <div className="text-sm text-gray-900 dark:text-gray-100 overflow-hidden">
        {renderContentWithCodeBlocks(getDisplayContent())}
      </div>
      {message.content.length > 500 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
      {message.metadata && message.metadata.token_count && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {message.metadata.token_count} tokens
        </div>
      )}
    </div>
  );
};

export default MessageItem;

// frontend/src/components/code/CodeEditor.jsx
// Editor de código con vista previa

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiEye, FiEyeOff, FiSave, FiCopy } from 'react-icons/fi';

const CodeEditor = ({ initialCode = '', language = 'html', onChange, onSave, onRun }) => {
  const [code, setCode] = useState(initialCode);
  const [showPreview, setShowPreview] = useState(true);
  
  const handleCodeChange = (value) => {
    setCode(value);
    if (onChange) onChange(value);
  };
  
  const handleSave = () => {
    if (onSave) onSave(code);
  };
  
  const handleRun = () => {
    if (onRun) onRun(code);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };
  
  const renderPreview = () => {
    if (!showPreview) return null;
    
    if (language === 'html') {
      return (
        <div className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 overflow-hidden h-full">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Vista previa</h3>
          </div>
          <div className="p-4 h-full overflow-auto">
            <iframe
              title="preview"
              srcDoc={code}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 overflow-hidden h-full">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Vista previa no disponible para {language}</h3>
        </div>
        <div className="p-4 h-full overflow-auto">
          <p className="text-gray-500 dark:text-gray-400">
            La vista previa solo está disponible para código HTML.
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
        <div className="flex space-x-2">
          <select
            value={language}
            onChange={(e) => onChange && onChange(code, e.target.value)}
            className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="jsx">JSX</option>
            <option value="python">Python</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRun}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            title="Ejecutar código"
          >
            <FiPlay className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            title="Guardar"
          >
            <FiSave className="h-4 w-4" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            title="Copiar al portapapeles"
          >
            <FiCopy className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            title={showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
          >
            {showPreview ? (
              <FiEyeOff className="h-4 w-4" />
            ) : (
              <FiEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className={`flex-grow flex ${showPreview ? 'space-x-4' : ''}`}>
        <div className={showPreview ? 'w-1/2' : 'w-full'}>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              tabSize: 2,
              automaticLayout: true
            }}
          />
        </div>
        {showPreview && (
          <div className="w-1/2">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;

// frontend/src/components/projects/ProjectForm.jsx
// Formulario para crear/editar proyectos

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createProject, updateProject } from '../../store/slices/projectsSlice';
import { FiPlus, FiX, FiSave } from 'react-icons/fi';

const ProjectForm = ({ project = null, isEditing = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    builderLlm: 'claude',
    judgeLlm: 'chatgpt',
    tags: [],
    status: 'active'
  });
  
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inicializar formulario con datos del proyecto si estamos editando
  useEffect(() => {
    if (isEditing && project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        builderLlm: project.config?.builder_llm || 'claude',
        judgeLlm: project.config?.judge_llm || 'chatgpt',
        tags: project.tags || [],
        status: project.status || 'active'
      });
    }
  }, [isEditing, project]);
  
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
  
  const addTag = () => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag.trim()]
      });
      setTag('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        tags: formData.tags,
        status: formData.status,
        config: {
          builder_llm: formData.builderLlm,
          judge_llm: formData.judgeLlm
        }
      };
      
      if (isEditing) {
        await dispatch(updateProject({ id: project.id, projectData })).unwrap();
        navigate(`/projects/${project.id}`);
      } else {
        const result = await dispatch(createProject(projectData)).unwrap();
        navigate(`/projects/${result.project.id}`);
      }
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      setErrors({
        submit: error.message || 'Error al guardar el proyecto'
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
          Nombre *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            LLM para Builder
          </label>
          <select
            name="builderLlm"
            value={formData.builderLlm}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="claude">Claude</option>
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            LLM para Judge
          </label>
          <select
            name="judgeLlm"
            value={formData.judgeLlm}
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
          Estado
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="active">Activo</option>
          <option value="archived">Archivado</option>
          <option value="completed">Completado</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Etiquetas
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Añadir etiqueta"
          />
          <button
            type="button"
            onClick={addTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiPlus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map((t, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="flex-shrink-0 ml-1.5 inline-flex text-blue-600 dark:text-blue-400 focus:outline-none"
              >
                <FiX className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate(isEditing ? `/projects/${project.id}` : '/projects')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
