import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, Mail, Shield, User, ArrowRight, CheckSquare, Trash2, RotateCcw } from 'lucide-react';

export const TeamDirectory: React.FC = () => {
  const { users, currentUser, switchUser, getUserSubordinates, tasks, setUserToDelete, resetToDefaultUsers } = useApp();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const filteredUsers = users.filter(u => {
    if (departmentFilter !== 'ALL' && u.department !== departmentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[11px] font-mono font-bold">
              MEMBERS DIRECTORY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Team & Leadership Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {users.length} active enterprise members across all hierarchy levels.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Depts</option>
            <option value="Executive">Executive</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
          </select>

          <button
            onClick={resetToDefaultUsers}
            title="Reset to default seed team"
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const isCurrent = user.id === currentUser.id;
          const manager = users.find(m => m.id === user.managerId);
          const subordinates = getUserSubordinates(user.id);
          const userTasks = tasks.filter(t => t.assigneeId === user.id);

          return (
            <div
              key={user.id}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                isCurrent ? 'border-emerald-500 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-white text-sm">
                      L{user.hierarchyLevel}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {user.name}
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[9px] font-extrabold">
                            YOU
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">{user.role}</p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => setUserToDelete(user)}
                    title={`Delete role: ${user.name}`}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Hierarchy Tier:</span>
                    <span className="font-bold text-slate-200">Level {user.hierarchyLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reports To:</span>
                    <span className="text-slate-200 truncate max-w-[140px]">{manager ? manager.name : 'Executive Root'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Direct Reports:</span>
                    <span className="text-slate-200">{subordinates.length} members</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active Tasks:</span>
                    <span className="text-emerald-400 font-mono font-bold">{userTasks.length} tasks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2">
                {!isCurrent ? (
                  <button
                    onClick={() => switchUser(user.id)}
                    className="flex-1 py-2 px-3 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-800 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Switch Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="flex-1 py-2 text-center text-xs font-bold text-emerald-400">
                    Active User Session
                  </span>
                )}

                <button
                  onClick={() => setUserToDelete(user)}
                  className="p-2 bg-slate-950 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Delete this role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
