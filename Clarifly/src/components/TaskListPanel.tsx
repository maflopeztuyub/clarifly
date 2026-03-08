'use client';

import { useState } from 'react';
import type { GeneratedTask } from '@/types';

interface TaskListPanelProps {
  tasks: GeneratedTask[];
  isProcessing?: boolean;
  onlyShowRephrased?: boolean;
}

export default function TaskListPanel({ tasks, isProcessing = false, onlyShowRephrased = false }: TaskListPanelProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!tasks.length && !isProcessing) {
    return null;
  }

  const priorityColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-green-50 border-green-200',
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const clarityBadgeColors = {
    clear: 'bg-green-100 text-green-800',
    'somewhat unclear': 'bg-yellow-100 text-yellow-800',
    unclear: 'bg-red-100 text-red-800',
  };

  const clarityIcons = {
    clear: '✓',
    'somewhat unclear': '⚠',
    unclear: '❌',
  };

  const handleCopyTasks = async () => {
    const taskText = tasks
      .map((task, idx) => {
        const label = onlyShowRephrased ? task.rephrased : `${task.original}\n→ ${task.rephrased}`;
        return `${idx + 1}. ${label}`;
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(taskText);
      alert('Tasks copied to clipboard!');
    } catch {
      console.error('Failed to copy tasks');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Generated Task List</h2>
        {tasks.length > 0 && (
          <button
            onClick={handleCopyTasks}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-lg transition-colors"
            title="Copy all tasks to clipboard"
          >
            📋 Copy All
          </button>
        )}
      </div>

      {isProcessing && !tasks.length && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin text-4xl mb-4">✨</div>
            </div>
            <p className="text-gray-600 font-medium">Analyzing your lecture...</p>
            <p className="text-sm text-gray-500 mt-2">Generating clear, actionable tasks.</p>
          </div>
        </div>
      )}

      {!isProcessing && tasks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">No tasks detected yet.</p>
          <p className="text-gray-500 text-sm mt-2">Record audio to generate a task list.</p>
        </div>
      )}

      {!isProcessing && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${priorityColors[task.priority]} ${
                selectedTaskId === task.id ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">Task</span>
                  </div>
                  {!onlyShowRephrased && (
                    <p className="text-gray-700 font-medium mb-3 text-base leading-relaxed">{task.original}</p>
                  )}
                </div>
              </div>

              {/* Rephrased Task */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">🎯 Rephrased Task:</p>
                <p className="text-gray-800 font-medium leading-relaxed text-base">{task.rephrased}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${priorityBadgeColors[task.priority]}`}>
                  {task.priority} priority
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${clarityBadgeColors[task.clarity]}`}>
                  {clarityIcons[task.clarity]} {task.clarity}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {Math.round(task.confidence * 100)}% confident
                </span>
              </div>

              {/* Expandable Details */}
              {selectedTaskId === task.id && (
                <div className="mt-4 pt-4 border-t border-gray-300 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">📋 Fulfillment Assessment:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{task.fulfillmentAssessment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">📅 Suggested Next Step:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{task.suggestedNextStep}</p>
                  </div>
                </div>
              )}

              {/* Click to expand hint */}
              <p className="text-xs text-gray-500 mt-3">
                {selectedTaskId === task.id ? '▼ Click to collapse' : '▶ Click to expand details'}
              </p>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Click on any task to see fulfillment details and suggested next steps. These are designed to help you
            understand exactly what you need to do and when.
          </p>
        </div>
      )}
    </div>
  );
}
