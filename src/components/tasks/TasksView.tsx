import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useLeads } from '../../context/LeadContext';
import { getAllTasks } from '../../services/taskService';
import { TaskStatus, TaskPriority } from '../../types';

export function TasksView() {
  const { leads, updateTaskStatus, deleteTask, openLeadDetail, addTask } = useLeads();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const allTasks = getAllTasks();

  const filtered = allTasks.filter(item => {
    const t = item.task;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.businessName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const pendingCount = allTasks.filter(t => t.task.status !== 'Completed').length;
  const completedCount = allTasks.filter(t => t.task.status === 'Completed').length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Outreach & Research Tasks
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              {pendingCount} Pending Action Items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Website audits, decision-maker discovery, and cold outreach follow-ups for Australian medical leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task or business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-subtle focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle font-semibold">
          {[
            { id: 'all', label: `All Tasks (${allTasks.length})` },
            { id: 'Pending', label: `Pending (${allTasks.filter(t => t.task.status === 'Pending').length})` },
            { id: 'In Progress', label: `In Progress (${allTasks.filter(t => t.task.status === 'In Progress').length})` },
            { id: 'Completed', label: `Completed (${completedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Priority:</span>
          {['all', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg border font-semibold capitalize transition-all ${
                priorityFilter === p
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map(item => {
            const t = item.task;
            const isCompleted = t.status === 'Completed';

            return (
              <div
                key={t.id}
                className="p-5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => updateTaskStatus(item.businessId, t.id, e.target.checked ? 'Completed' : 'Pending')}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className={`font-bold text-sm leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{t.description}</p>
                    )}
                    
                    {/* Linked Business Link */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 flex-wrap">
                      <span 
                        onClick={() => openLeadDetail(item.businessId)}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" /> {item.businessName} ({item.state})
                      </span>
                      {t.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> Due: {t.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    t.priority === 'High' 
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' 
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                  }`}>
                    {t.priority}
                  </span>

                  <button
                    onClick={() => openLeadDetail(item.businessId)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1"
                  >
                    View Lead <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteTask(item.businessId, t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No tasks found matching your filter</p>
          </div>
        )}
      </div>

    </div>
  );
}
