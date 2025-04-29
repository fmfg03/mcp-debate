// frontend/src/components/common/DownloadProjectZip.jsx
import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const DownloadProjectZip = ({ projectFiles, projectName }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Organiza los archivos por directorios
  const organizeFiles = (files) => {
    const tree = {};
    
    files.forEach(file => {
      // Usar el nombre del archivo como clave
      tree[file.name] = file.content;
    });
    
    return tree;
  };

  const generateZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const fileTree = organizeFiles(projectFiles);
      
      // Añadir todos los archivos al zip
      Object.entries(fileTree).forEach(([path, content]) => {
        zip.file(path, content);
      });
      
      // Generar README.md con información del proyecto
      const readmeContent = `# ${projectName || 'MCP System Project'}
      
## Archivos generados por MCP System
Este archivo zip contiene todos los archivos relacionados con el proyecto "${projectName || 'MCP System'}".

## Estructura
${Object.keys(fileTree).map(path => `- ${path}`).join('\n')}

Generado el ${new Date().toLocaleDateString()} por MCP System.
`;
      
      zip.file('README.md', readmeContent);
      
      // Generar y descargar el archivo ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${projectName || 'mcp-project'}.zip`);
      
    } catch (error) {
      console.error('Error al generar ZIP:', error);
      alert('Error al generar el archivo ZIP. Por favor, intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateZip}
      disabled={isGenerating}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {isGenerating ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
          Generando ZIP...
        </>
      ) : (
        <>
          <FiDownload className="mr-2 h-5 w-5" />
          Descargar como ZIP
        </>
      )}
    </button>
  );
};

export default DownloadProjectZip;
