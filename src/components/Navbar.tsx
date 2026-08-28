import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  CheckSquare, 
  GitBranch, 
  Users, 
  BarChart3, 
  Bell, 
  Plus, 
  ChevronDown, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    users, 
    tasks, 
    notifications,
    activeTab, 
    setActiveTab, 
    setShowAuthModal, 
    setShowCreateModal,
    switchUser,
    canUserCreateTasks,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedTaskId
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute pending approvals where currentUser is the active reviewer
  const pendingApprovalsCount = tasks.filter(t => {
    if (t.status !== 'PENDING_APPROVAL') return false;
    const currentTier = t.approvalTiers[t.currentTierIndex];
    return currentTier && currentTier.reviewerId === currentUser.id && currentTier.status === 'PENDING';
  }).length;

  const unreadNotificationsCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  const canCreate = canUserCreateTasks(currentUser.id);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">TaskForge</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block">Hierarchical Governance Engine</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'approvals'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'hierarchy'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-teal-400" />
              <span>Org Hierarchy</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'team'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Team Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right Actions: Create Task, Notifications, Quick Role Switcher */}
          <div className="flex items-center gap-2.5">
            
            {/* Create Task Button */}
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Create Task</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Notifications ({userNotifications.length})</span>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-emerald-400 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                    {userNotifications.length > 0 ? (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.taskId) {
                              setSelectedTaskId(n.taskId);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-800/60 transition-colors ${
                            !n.read ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {n.type === 'APPROVAL_REQUIRED' ? (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-200">{n.title}</p>
                              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-xs">No notifications yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-emerald-500/60 rounded-2xl transition-all text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  L{currentUser.hierarchyLevel}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 truncate max-w-[120px]">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch Active Role</span>
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setShowAuthModal(true);
                      }}
                      className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      All Roles / Register
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                          u.id === currentUser.id
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-bold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 shrink-0 ml-2">
                          L{u.hierarchyLevel}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 mt-1">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setShowAuthModal(true);
                      }}
                      className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Prototype Role Hub</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prototype Hub Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Prototype Auth & Role Selector"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Prototype Hub</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
