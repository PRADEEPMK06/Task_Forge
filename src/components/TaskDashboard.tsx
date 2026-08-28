import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus } from '../types';
import { 
  CheckSquare, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Plus, 
  Filter, 
  SlidersHorizontal,
  ArrowUpRight,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const TaskDashboard: React.FC = () => {
  const { 
    tasks, 
    currentUser, 
    setSelectedTaskId, 
    setShowCreateModal, 
    canUserCreateTasks 
  } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const canCreate = canUserCreateTasks(currentUser.id);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchAssignee = t.assigneeName.toLowerCase().includes(q);
      const matchCreator = t.creatorName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee && !matchCreator) return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

    // View filter type
    if (filterType === 'ASSIGNED_TO_ME') return t.assigneeId === currentUser.id;
    if (filterType === 'CREATED_BY_ME') return t.creatorId === currentUser.id;
    if (filterType === 'PENDING') return t.status === 'PENDING_APPROVAL';
    if (filterType === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    if (filterType === 'COMPLETED') return t.status === 'COMPLETED';

    return true;
  });

  // Calculate high-level stats
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingApprovalCount = tasks.filter(t => t.status === 'PENDING_APPROVAL').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner & Metrics Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                LEVEL {currentUser.hierarchyLevel} • {currentUser.role}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Hierarchical task management and multi-tier delegation workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Hierarchical Task</span>
              </button>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-slate-400 text-xs flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>Level 4 Contributor (Task execution mode)</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Tasks</span>
              <CheckSquare className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-2xl font-extrabold text-white font-mono">{totalTasks}</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-extrabold text-blue-400 font-mono">{inProgressCount}</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Approval</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{pendingApprovalCount}</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'ALL', label: 'All Tasks' },
            { id: 'ASSIGNED_TO_ME', label: 'Assigned to Me' },
            { id: 'CREATED_BY_ME', label: 'Created by Me' },
            { id: 'PENDING', label: 'Pending Approval' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Priority Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, assignees, keywords..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => {
          const isAssignee = task.assigneeId === currentUser.id;
          const isCreator = task.creatorId === currentUser.id;
          
          return (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      task.status === 'PENDING_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      task.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      task.priority === 'URGENT' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      task.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.isCrossLevel && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                      Tier {task.currentTierIndex + 1}/{task.approvalTiers.length}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {task.description || 'No description provided.'}
                </p>

                {/* Assignee & Creator Info */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      To: <strong className="text-slate-200">{task.assigneeName}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">{task.dueDate}</span>
                </div>

              </div>

              {/* Progress Footer */}
              <div className="pt-4 mt-3 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-mono font-bold text-white">{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No tasks match current filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new task.
          </p>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl"
            >
              Create New Task
            </button>
          )}
        </div>
      )}

    </div>
  );
};
