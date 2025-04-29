// frontend/src/pages/DebateView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDebate, generateNextTurn } from '../store/slices/debateSlice';
import { fetchProject } from '../store/slices/projectsSlice';
import { FiArrowLeft, FiPlay, FiCheck } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import DebateEntry from '../components/debates/DebateEntry';

const DebateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentDebate, isLoading, error } = useSelector((state) => state.debate);
  const { currentProject } = useSelector((state) => state.projects);
  
  useEffect(() => {
    dispatch(fetchDebate(id));
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentDebate && currentDebate.project_id) {
      dispatch(fetchProject(currentDebate.project_id));
    }
  }, [dispatch, currentDebate]);
  
  const handleGenerateNextTurn = () => {
    dispatch(generateNextTurn(id));
  };
  
  const isDebateCompleted = currentDebate && currentDebate.status === 'completed';
  
  if (isLoading && !currentDebate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Cargando debate...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!currentDebate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Debate no encontrado o sin acceso.
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
      
      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Cabecera */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={`/projects/${currentDebate.project_id}`}
                className="mr-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentDebate.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Proyecto: {currentProject?.name || 'Cargando...'}
                </p>
              </div>
            </div>
            
            {!isDebateCompleted && (
              <button
                onClick={handleGenerateNextTurn}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <FiPlay className="-ml-1 mr-2 h-5 w-5" />
                    Siguiente Turno
                  </>
                )}
              </button>
            )}
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
          
          {/* Información del Debate */}
// Dentro de ProjectView.jsx, después de la sección de Conversaciones

{/* Debates */}
<div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
      Debates
    </h2>
    <button
      onClick={() => setShowNewDebateModal(true)}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <FiPlus className="-ml-0.5 mr-2 h-4 w-4" />
      Nuevo Debate
    </button>
  </div>
  
  {debatesLoading ? (
    <div className="p-6 text-center">
      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando debates...</p>
    </div>
  ) : debates.length > 0 ? (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {debates.map((debate) => (
        <li key={debate.id}>
          <Link
            to={`/debates/${debate.id}`}
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
                      {debate.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {debate.topic.length > 100 ? debate.topic.substring(0, 100) + '...' : debate.topic}
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${
                    debate.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {debate.status === 'completed' ? 'Completado' : `Turno ${debate.current_turn} de ${debate.max_turns}`}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <div className="p-6 text-center">
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        No hay debates en este proyecto.
      </p>
      <button
        onClick={() => setShowNewDebateModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FiPlus className="-ml-1 mr-2 h-5 w-5" />
        Crear un debate
      </button>
    </div>
  )}
</div>

{/* Modal de nuevo debate */}
{showNewDebateModal && (
  <div className="fixed z-10 inset-0 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
      </div>
      
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Nuevo Debate
          </h3>
          <div className="mt-4">
            <CreateDebateForm 
              projectId={currentProject.id}
              onClose={() => setShowNewDebateModal(false)}
              onSuccess={(debate) => {
                setShowNewDebateModal(false);
                navigate(`/debates/${debate.id}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)}
          
{/* Información del Debate */}
<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
  <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
    Tema: {currentDebate.topic}
  </h2>
  <div className="flex flex-wrap gap-4 mt-4">
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
        Estado:
      </span>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isDebateCompleted 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      }`}>
        {isDebateCompleted ? 'Completado' : 'En progreso'}
      </span>
    </div>
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
        Turno:
      </span>
      <span className="text-sm text-gray-900 dark:text-white">
        {currentDebate.current_turn} de {currentDebate.max_turns}
      </span>
    </div>
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
        Agentes:
      </span>
      <div className="flex items-center">
        <span className="text-sm text-purple-600 dark:text-purple-400 mr-1">
          {currentDebate.agent_a === 'claude' ? 'Claude' : 'ChatGPT'}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mx-1">vs</span>
        <span className="text-sm text-amber-600 dark:text-amber-400">
          {currentDebate.agent_b === 'claude' ? 'Claude' : 'ChatGPT'}
        </span>
      </div>
    </div>
  </div>
  
  {isDebateCompleted && (
    <div className="mt-4 flex items-center p-2 rounded-md bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300">
      <FiCheck className="mr-2 h-5 w-5" />
      Debate completo - Se han generado todos los turnos
    </div>
  )}
</div>

{/* Entradas del Debate */}
<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
    Desarrollo del Debate
  </h2>
  
  {currentDebate.entries && currentDebate.entries.length > 0 ? (
    <div className="space-y-8">
      {currentDebate.entries.map((entry, index) => (
        <DebateEntry 
          key={entry.id} 
          entry={entry} 
          index={index}
          totalEntries={currentDebate.entries.length}
        />
      ))}
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Este debate aún no tiene entradas.
      </p>
      {!isDebateCompleted && (
        <button
          onClick={handleGenerateNextTurn}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <FiPlay className="-ml-1 mr-2 h-5 w-5" />
          Iniciar Debate
        </button>
      )}
    </div>
  )}
</div>
