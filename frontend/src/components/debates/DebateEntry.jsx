// frontend/src/components/debates/DebateEntry.jsx
import React from 'react';
import { FiCpu } from 'react-icons/fi';

const DebateEntry = ({ entry, index, totalEntries }) => {
  const isFirstTurn = index === 0;
  const isLastTurn = index === totalEntries - 1;
  
  const getAgentColor = (agent) => {
    return agent === 'claude' ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400';
  };
  
  const getTurnLabel = () => {
    if (isFirstTurn) return 'Apertura';
    if (isLastTurn) return 'Conclusión';
    return `Turno ${entry.turn_number}`;
  };
  
  return (
    <div className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 mb-6">
      <div className="flex items-center mb-2">
        <FiCpu className={`mr-2 h-5 w-5 ${getAgentColor(entry.agent)}`} />
        <div>
          <span className={`font-medium ${getAgentColor(entry.agent)}`}>
            {entry.agent === 'claude' ? 'Claude' : 'ChatGPT'}
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {getTurnLabel()}
          </span>
        </div>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {entry.content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-3">{paragraph}</p>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {new Date(entry.created_at).toLocaleString()} • {entry.token_count} tokens
      </div>
    </div>
  );
};

export default DebateEntry;
