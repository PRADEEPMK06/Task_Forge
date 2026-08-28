import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { 
  GitBranch, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  UserCheck, 
  Shield, 
  Sparkles, 
  ArrowRight,
  Building2,
  Mail,
  Trash2,
  RotateCcw
} from 'lucide-react';

export const HierarchyView: React.FC = () => {
  const { users, currentUser, switchUser, getUserSubordinates, tasks, setUserToDelete, resetToDefaultUsers } = useApp();

  const [expandedUsers, setExpandedUsers] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const toggleExpand = (id: number) => {
    setExpandedUsers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find root level users (managerId is null or 1)
  const rootUsers = users.filter(u => u.managerId === null);

  const renderNode = (user: User, depth: number = 0) => {
    const subordinates = getUserSubordinates(user.id);
    const isExpanded = !!expandedUsers[user.id];
    const isCurrent = user.id === currentUser.id;
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const pendingTasks = userTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED');

    return (
      <div key={user.id} className="space-y-2">
        <div 
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
            isCurrent
              ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
          style={{ marginLeft: `${Math.min(depth * 24, 96)}px` }}
        >
          <div className="flex items-center gap-3">
            {subordinates.length > 0 ? (
              <button
                onClick={() => toggleExpand(user.id)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            )}

            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              L{user.hierarchyLevel}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">{user.name}</h4>
                
                {user.hierarchyLevel === 1 && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/60">
                    👑 Executive
                  </span>
                )}
                {user.hierarchyLevel === 2 && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    💼 Director / VP
                  </span>
                )}
                {user.hierarchyLevel === 3 && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/60">
                    ⚡ Lead / Supervisor
                  </span>
                )}
                {user.hierarchyLevel === 4 && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-800 text-slate-400">
                    👩‍💻 Contributor
                  </span>
                )}

                {isCurrent && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-extrabold">
                    YOU
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{user.role}</span>
                <span>•</span>
                <span className="text-slate-500">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
              {subordinates.length} Direct Report{subordinates.length === 1 ? '' : 's'}
            </span>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
              {pendingTasks.length} Active Task{pendingTasks.length === 1 ? '' : 's'}
            </span>

            {!isCurrent && (
              <button
                onClick={() => switchUser(user.id)}
                className="px-3 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-emerald-500 flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Role</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setUserToDelete(user)}
              title={`Delete role: ${user.name}`}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recursive render child nodes if expanded */}
        {isExpanded && subordinates.length > 0 && (
          <div className="space-y-2 border-l border-slate-800/80 pl-2">
            {subordinates.map(sub => renderNode(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-mono font-bold">
              ORGANIZATION ARCHITECTURE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive Organizational Tree
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Visual reporting lines and governance tiers determining task assignment policies and approval hierarchies.
          </p>
        </div>

        <button
          onClick={resetToDefaultUsers}
          title="Reset to standard seed hierarchy"
          className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Hierarchy Defaults</span>
        </button>
      </div>

      {/* Tree Container */}
      <div className="space-y-3">
        {rootUsers.map(root => renderNode(root, 0))}
      </div>

    </div>
  );
};
