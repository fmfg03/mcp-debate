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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Tema: {currentDebate.topic}
            </h2>
            <div className="flex flex-wrap
