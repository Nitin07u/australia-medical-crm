import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Search, 
  Trash2, 
  Check, 
  Building2,
  Calendar,
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
    <div className="pt-8 px-7 pb-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Outreach & Research Tasks
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
              {pendingCount} Pending Action Items
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Website audits, decision-maker discovery, and cold outreach follow-ups for Australian medical leads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task or business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-xs text-xs">
        <div className="flex items-center gap-1.5 font-semibold">
          {[
            { id: 'all', label: `All Tasks (${allTasks.length})` },
            { id: 'Pending', label: `Pending (${allTasks.filter(t => t.task.status === 'Pending').length})` },
            { id: 'In Progress', label: `In Progress (${allTasks.filter(t => t.task.status === 'In Progress').length})` },
            { id: 'Completed', label: `Completed (${completedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#64748B] font-medium">Priority:</span>
          {['all', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                priorityFilter === p
                  ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
              }`}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(item => {
            const t = item.task;
            const isCompleted = t.status === 'Completed';

            return (
              <div
                key={t.id}
                className={`bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all flex items-center justify-between gap-4 flex-wrap ${
                  isCompleted ? 'opacity-60 bg-[#F8FAFC]' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => updateTaskStatus(item.businessId, t.id, isCompleted ? 'Pending' : 'Completed')}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                      isCompleted 
                        ? 'bg-[#047857] border-[#047857] text-white' 
                        : 'border-[#CBD5E1] bg-white hover:border-[#2563EB]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  {/* Task Content */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        t.priority === 'High' 
                          ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]' 
                          : t.priority === 'Medium'
                          ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                          : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                      }`}>
                        {t.priority} Priority
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                        isCompleted 
                          ? 'bg-[#ECFDF5] text-[#047857]' 
                          : t.status === 'In Progress'
                          ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold text-[#0F172A] ${isCompleted ? 'line-through text-[#94A3B8]' : ''}`}>
                      {t.title}
                    </h4>

                    {t.description && (
                      <p className="text-[11px] text-[#64748B]">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-0.5">
                      <span 
                        onClick={() => openLeadDetail(item.businessId)}
                        className="font-semibold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3" /> {item.businessName}
                      </span>

                      {t.due_date && (
                        <span className="flex items-center gap-1 text-[#94A3B8]">
                          <Calendar className="w-3 h-3" /> Due {t.due_date}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openLeadDetail(item.businessId)}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold border border-[#E2E8F0] hover:border-[#BFDBFE] transition-colors"
                  >
                    Open Lead
                  </button>

                  <button
                    onClick={() => deleteTask(item.businessId, t.id)}
                    className="p-1.5 rounded-lg hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#B91C1C] transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-[#94A3B8] bg-white rounded-xl border border-[#E2E8F0]">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-[#CBD5E1]" />
            <p className="font-semibold text-sm text-[#475569]">No tasks matching filter</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">All action items and follow-ups are clear</p>
          </div>
        )}
      </div>

    </div>
  );
}
