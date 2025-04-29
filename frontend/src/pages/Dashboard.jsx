// frontend/src/pages/Dashboard.jsx
// Página de dashboard principal

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../store/slices/projectsSlice';
import { FiPlus, FiClock, FiBarChart2, FiStar } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { projects, isLoading } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Obtener proyectos recientes (últimos 3)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  // Obtener proyectos activos
  const activeProjects = projects.filter((p) => p.status === 'active');
  
  // Calcular estadísticas básicas
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Proyecto
            </Link>
          </div>
          
          <div className="flex flex-col space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <FiBarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Proyectos
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {totalProjects}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <FiStar className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Proyectos Activos
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {activeProjects.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <FiClock className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Completados
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {completedProjects}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actividad reciente */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Actividad Reciente
                </h3>
              </div>
              
              {isLoading ? (
                <div className="p-5 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
                </div>
              ) : recentProjects.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentProjects.map((project) => (
                    <li key={project.id}>
                      <Link
                        to={`/projects/${project.id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                              {project.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  project.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : project.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {project.status === 'active'
                                  ? 'Activo'
                                  : project.status === 'completed'
                                  ? 'Completado'
                                  : 'Archivado'}
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {project.description ? (
                              project.description.length > 100
                                ? `${project.description.substring(0, 100)}...`
                                : project.description
                            ) : (
                              'Sin descripción'
                            )}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Última actualización:{' '}
                            {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay proyectos recientes.
                    <br />
                    <Link
                      to="/projects/new"
                      className="inline-flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FiPlus className="mr-1" />
                      Crear un nuevo proyecto
                    </Link>
                  </p>
                </div>
              )}
              
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg text-right">
                <Link
                  to="/projects"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todos los proyectos
                </Link>
              </div>
            </div>
            
            {/* Sugerencias o más contenido */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Bienvenido al MCP System
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                MCP System es una plataforma de desarrollo web colaborativo que utiliza Claude y ChatGPT como agentes autónomos.
                Crea un nuevo proyecto para comenzar a trabajar con estos potentes asistentes de IA.
              </p>
              <div className="mt-4">
                <Link
                  to="/projects/new"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Comenzar ahora →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

// frontend/src/pages/ProjectsPage.jsx
// Página de lista de proyectos

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects, deleteProject } from '../store/slices/projectsSlice';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/projects/ProjectCard';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.projects);
  
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  
  const handleDeleteProject = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      dispatch(deleteProject(id));
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Aplicar filtros
  const filteredProjects = projects.filter((project) => {
    // Filtro por estado
    if (filters.status !== 'all' && project.status !== filters.status) {
      return false;
    }
    
    // Filtro por búsqueda
    if (
      filters.search &&
      !project.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !project.description?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Proyectos
            </h1>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Proyecto
            </Link>
          </div>
          
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <FiFilter className="mr-2 text-gray-400" />
                <label htmlFor="status" className="sr-only">
                  Filtrar por estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="completed">Completados</option>
                  <option value="archived">Archivados</option>
                </select>
              </div>
              
              <div className="flex-grow relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Buscar proyectos..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-grow">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filters.search || filters.status !== 'all'
                  ? 'No se encontraron proyectos con los filtros aplicados.'
                  : 'No hay proyectos disponibles.'}
              </p>
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Crear nuevo proyecto
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;

// frontend/src/pages/ProjectView.jsx
// Página de vista detallada de un proyecto

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProject, deleteProject } from '../store/slices/projectsSlice';
import { fetchConversations, createConversation } from '../store/slices/conversationSlice';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProject, isLoading: projectLoading } = useSelector((state) => state.projects);
  const { conversations, isLoading: conversationsLoading } = useSelector((state) => state.conversation);
  
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  
  useEffect(() => {
    dispatch(fetchProject(id));
    dispatch(fetchConversations(id));
  }, [dispatch, id]);
  
  const handleDeleteProject = () => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      dispatch(deleteProject(id)).then(() => {
        navigate('/projects');
      });
    }
  };
  
  const handleCreateConversation = (e) => {
    e.preventDefault();
    
    dispatch(
      createConversation({
        projectId: id,
        title: newConversationTitle || `Conversación ${new Date().toLocaleDateString()}`,
        builderLlm: currentProject?.config?.builder_llm || 'claude',
        judgeLlm: currentProject?.config?.judge_llm || 'chatgpt',
      })
    ).then((result) => {
      setShowNewConversationModal(false);
      setNewConversationTitle('');
      navigate(`/conversations/${result.payload.id}`);
    });
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };
  
  if (projectLoading && !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando proyecto...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Proyecto no encontrado o sin acceso.
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                Volver a proyectos
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Cabecera del proyecto */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {currentProject.name}
                  </h1>
                  <span
                    className={`ml-3 px-2.5 py-0.5 text-xs font-medium rounded-full
                      ${
                        currentProject.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : currentProject.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {currentProject.status === 'active'
                      ? 'Activo'
                      : currentProject.status === 'completed'
                      ? 'Completado'
                      : 'Archivado'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {currentProject.description || 'Sin descripción'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentProject.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                <div className="flex space-x-3">
                  <Link
                    to={`/projects/${id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiEdit2 className="-ml-0.5 mr-2 h-4 w-4" />
                    Editar
                  </Link>
                  <button
                    onClick={handleDeleteProject}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiTrash2 className="-ml-0.5 mr-2 h-4 w-4" />
                    Eliminar
                  </button>
                </div>
                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Builder:</span> {currentProject.config?.builder_llm || 'Claude'}
                  </div>
                  <div>
                    <span className="font-medium">Judge:</span> {currentProject.config?.judge_llm || 'ChatGPT'}
                  </div>
                  <div>
                    <span className="font-medium">Última actualización:</span> {formatDate(currentProject.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conversaciones */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Conversaciones
              </h2>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-0.5 mr-2 h-4 w-4" />
                Nueva Conversación
              </button>
            </div>
            
            {conversationsLoading ? (
              <div className="p-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando conversaciones...</p>
              </div>
            ) : conversations.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      to={`/conversations/${conversation.id}`}
                      className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="px-6 py-4 flex items-center">
                        <div className="min-w-0 flex-1 flex items-center">
                          <div className="flex-shrink-0">
                            <FiMessageSquare className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1 px-4">
                            <div>
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                                {conversation.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Builder: {conversation.builder_llm} | Judge: {conversation.judge_llm}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-3 flex-shrink-0 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(conversation.updated_at)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No hay conversaciones en este proyecto.
                </p>
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  Crear una conversación
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Modal de nueva conversación */}
      {showNewConversationModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Nueva Conversación
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleCreateConversation}>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Título
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={newConversationTitle}
                        onChange={(e) => setNewConversationTitle(e.target.value)}
                        placeholder="Título de la conversación"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        Esta conversación utilizará la configuración actual del proyecto:
                      </p>
                      <ul className="list-disc list-inside mt-2">
                        <li>Builder: {currentProject.config?.builder_llm || 'Claude'}</li>
                        <li>Judge: {currentProject.config?.judge_llm || 'ChatGPT'}</li>
                      </ul>
                    </div>
                  </form>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateConversation}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewConversationModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;

// frontend/src/pages/ConversationView.jsx
// Página de vista de una conversación

import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversation, joinConversation, leaveConversation, connectSocket } from '../store/slices/conversationSlice';
import { fetchProject } from '../store/slices/projectsSlice';
import { FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import ConversationPanel from '../components/conversation/ConversationPanel';
import CodeEditor from '../components/code/CodeEditor';

const ConversationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { token } = useSelector((state) => state.auth);
  const { currentConversation, isLoading, error, socket } = useSelector((state) => state.conversation);
  const { currentProject } = useSelector((state) => state.projects);
  
  useEffect(() => {
    // Conectar socket si no está conectado
    if (!socket && token) {
      dispatch(connectSocket(token));
    }
    
    // Cargar conversación
    dispatch(fetchConversation(id));
    
    // Unirse a la sala de la conversación
    dispatch(joinConversation(id));
    
    // Al desmontar, salir de la sala
    return () => {
      dispatch(leaveConversation(id));
    };
  }, [dispatch, id, socket, token]);
  
  // Cargar el proyecto relacionado cuando se carga la conversación
  useEffect(() => {
    if (currentConversation && currentConversation.project_id) {
      dispatch(fetchProject(currentConversation.project_id));
    }
  }, [dispatch, currentConversation]);
  
  if (isLoading && !currentConversation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando conversación...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!currentConversation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Conversación no encontrada o sin acceso.
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" />
                Volver a proyectos
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Cabecera */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={`/projects/${currentConversation.project_id}`}
                className="mr-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentConversation.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Proyecto: {currentProject?.name || 'Cargando...'}
                </p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-grow">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Interfaz principal de la conversación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de conversación */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden h-[calc(100vh-200px)]">
              <ConversationPanel conversationId={id} />
            </div>
            
            {/* Editor de código */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden h-[calc(100vh-200px)]">
              <CodeEditor
                language="html"
                initialCode="<!-- El código generado aparecerá aquí -->"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConversationView;

// frontend/src/pages/NewProject.jsx
// Página para crear un nuevo proyecto

import React from 'react';
import Navbar from '../components/layout/Navbar';
import ProjectForm from '../components/projects/ProjectForm';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NewProject = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex items-center">
            <Link
              to="/projects"
              className="mr-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Nuevo Proyecto
            </h1>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <ProjectForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewProject;

// frontend/src/pages/EditProject.jsx
// Página para editar un proyecto existente

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProject } from '../store/slices/projectsSlice';
import Navbar from '../components/layout/Navbar';
import ProjectForm from '../components/projects/ProjectForm';
import { FiArrowLeft } from 'react-icons/fi';

const EditProject = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProject, isLoading } = useSelector((state) => state.projects);
  
  useEffect(() => {
    dispatch(fetchProject(id));
  }, [dispatch, id]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex items-center">
            <Link
              to={`/projects/${id}`}
              className="mr-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Editar Proyecto
            </h1>
          </div>
          
          {isLoading && !currentProject ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando proyecto...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <ProjectForm project={currentProject} isEditing={true} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditProject;

// frontend/src/pages/Settings.jsx
// Página de configuración

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, updateApiKeys } from '../store/slices/authSlice';
import { toggleDarkMode } from '../store/slices/uiSlice';
import Navbar from '../components/layout/Navbar';
import { FiUser, FiKey, FiSettings, FiSun, FiMoon } from 'react-icons/fi';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
  });
  
  const [apiKeysForm, setApiKeysForm] = useState({
    claudeApiKey: '',
    chatgptApiKey: '',
  });
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleApiKeysChange = (e) => {
    const { name, value } = e.target;
    setApiKeysForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({
      fullName: profileForm.fullName,
    }));
  };
  
  const handleUpdateApiKeys = (e) => {
    e.preventDefault();
    dispatch(updateApiKeys({
      claudeApiKey: apiKeysForm.claudeApiKey,
      chatgptApiKey: apiKeysForm.chatgptApiKey,
    }));
    // Limpiar campos después de enviar
    setApiKeysForm({
      claudeApiKey: '',
      chatgptApiKey: '',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Configuración
          </h1>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-grow">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Perfil de Usuario */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Perfil de Usuario
                  </h2>
                </div>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">// frontend/src/pages/Dashboard.jsx
// Página de dashboard principal

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../store/slices/projectsSlice';
import { FiPlus, FiClock, FiBarChart2, FiStar } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { projects, isLoading } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Obtener proyectos recientes (últimos 3)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  // Obtener proyectos activos
  const activeProjects = projects.filter((p) => p.status === 'active');
  
  // Calcular estadísticas básicas
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Proyecto
            </Link>
          </div>
          
          <div className="flex flex-col space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <FiBarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Proyectos
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {totalProjects}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <FiStar className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Proyectos Activos
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {activeProjects.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <FiClock className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Completados
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {completedProjects}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actividad reciente */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Actividad Reciente
                </h3>
              </div>
              
              {isLoading ? (
                <div className="p-5 text-center">
                  <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
                </div>
              ) : recentProjects.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentProjects.map((project) => (
                    <li key={project.id}>
                      <Link
                        to={`/projects/${project.id}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                              {project.name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  project.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : project.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {project.status === 'active'
                                  ? 'Activo'
                                  : project.status === 'completed'
                                  ? 'Completado'
                                  : 'Archivado'}
                              </p>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {project.description ? (
                              project.description.length > 100
                                ? `${project.description.substring(0, 100)}...`
                                : project.description
                            ) : (
                              'Sin descripción'
                            )}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Última actualización:{' '}
                            {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay proyectos recientes.
                    <br />
                    <Link
                      to="/projects/new"
                      className="inline-flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <FiPlus className="mr-1" />
                      Crear un nuevo proyecto
                    </Link>
                  </p>
                </div>
              )}
              
              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg text-right">
                <Link
                  to="/projects"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todos los proyectos
                </Link>
              </div>
            </div>
            
            {/* Sugerencias o más contenido */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Bienvenido al MCP System
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                MCP System es una plataforma de desarrollo web colaborativo que utiliza Claude y ChatGPT como agentes autónomos.
                Crea un nuevo proyecto para comenzar a trabajar con estos potentes asistentes de IA.
              </p>
              <div className="mt-4">
                <Link
                  to="/projects/new"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Comenzar ahora →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

// frontend/src/pages/ProjectsPage.jsx
// Página de lista de proyectos

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects, deleteProject } from '../store/slices/projectsSlice';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/projects/ProjectCard';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects, isLoading, error } = useSelector((state) => state.projects);
  
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  
  const handleDeleteProject = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      dispatch(deleteProject(id));
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Aplicar filtros
  const filteredProjects = projects.filter((project) => {
    // Filtro por estado
    if (filters.status !== 'all' && project.status !== filters.status) {
      return false;
    }
    
    // Filtro por búsqueda
    if (
      filters.search &&
      !project.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !project.description?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Proyectos
            </h1>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Proyecto
            </Link>
          </div>
          
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                <FiFilter className="mr-2 text-gray-400" />
                <label htmlFor="status" className="sr-only">
                  Filtrar por estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="completed">Completados</option>
                  <option value="archived">Archivados</option>
                </select>
              </div>
              
              <div className="flex-grow relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Buscar proyectos..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-grow">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
              <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filters.search || filters.status !== 'all'
                  ? 'No se encontraron proyectos con los filtros aplicados.'
                  : 'No hay proyectos disponibles.'}
              </p>
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Crear nuevo proyecto
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;

// frontend/src/pages/ProjectView.jsx
// Página de vista detallada de un proyecto

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProject, deleteProject } from '../store/slices/projectsSlice';
import { fetchConversations, createConversation } from '../store/slices/conversationSlice';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProject, isLoading: projectLoading } = useSelector((state) => state.projects);
  const { conversations, isLoading: conversationsLoading } = useSelector((state) => state.conversation);
  
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  
  useEffect(() => {
    dispatch(fetchProject(id));
    dispatch(fetchConversations(id));
  }, [dispatch, id]);
  
  const handleDeleteProject = () => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      dispatch(deleteProject(id)).then(() => {
        navigate('/projects');
      });
    }
  };
  
  const handleCreateConversation = (e) => {
    e.preventDefault();
    
    dispatch(
      createConversation({
        projectId: id,
        title: newConversationTitle || `Conversación ${new Date().toLocaleDateString()}`,
        builderLlm: currentProject?.config?.builder_llm || 'claude',
        judgeLlm: currentProject?.config?.judge_llm || 'chatgpt',
      })
    ).then((result) => {
      setShowNewConversationModal(false);
      setNewConversationTitle('');
      navigate(`/conversations/${result
