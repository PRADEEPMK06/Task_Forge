import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, UserPlus, Key, Mail, ArrowRight, CheckCircle, Sparkles, Building2, Trash2, RotateCcw } from 'lucide-react';

export const PrototypeAuth: React.FC = () => {
  const { 
    users, 
    currentUser, 
    switchUser, 
    registerUser, 
    setShowAuthModal, 
    setActiveTab, 
    setUserToDelete, 
    resetToDefaultUsers 
  } = useApp();
  
  const [activeTab, setAuthTab] = useState<'roles' | 'register'>('roles');
  
  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Admin@123');
  const [role, setRole] = useState('');
  const [managerId, setManagerId] = useState<string>('2');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !role) return;

    const mgrId = managerId ? parseInt(managerId, 10) : null;
    const newUser = registerUser(name, email, password, role, mgrId);
    
    setSuccessMessage(`Account registered for ${newUser.name}! Moving directly to ${newUser.role} dashboard.`);
    setTimeout(() => {
      setShowAuthModal(false);
      setActiveTab('tasks');
    }, 400);
  };

  const handleLaunchRole = (userId: number) => {
    switchUser(userId);
    setShowAuthModal(false);
    setActiveTab('tasks');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">TaskForge Prototype Access Hub</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  PROTOTYPE MODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Switch instantly between roles or register a new member to test cross-level hierarchy workflows.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setAuthTab('roles')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'roles'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registered Roles ({users.length})
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register New Role
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            {successMessage}
          </div>
        )}

        <div className="p-6">
          {activeTab === 'roles' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Select a Role to Enter Dashboard
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Mail & Password displayed below for every registered test account.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Current Session: <strong className="text-emerald-400">{currentUser.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  const manager = users.find(m => m.id === u.managerId);
                  
                  return (
                    <div
                      key={u.id}
                      className={`relative bg-slate-950 rounded-2xl border p-4 transition-all duration-200 hover:border-emerald-500/60 ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-950/10 ring-1 ring-emerald-500/30'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{u.name}</h4>
                            
                            {u.hierarchyLevel === 1 && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/60">
                                👑 Level 1 (Executive)
                              </span>
                            )}
                            {u.hierarchyLevel === 2 && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60">
                                💼 Level 2 (Director / VP)
                              </span>
                            )}
                            {u.hierarchyLevel === 3 && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/60">
                                ⚡ Level 3 (Team Lead)
                              </span>
                            )}
                            {u.hierarchyLevel === 4 && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                👩‍💻 Level 4 (Contributor)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">{u.role}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {manager ? `Reports to ${manager.name} (${manager.role})` : 'Top Level / Executive Root'}
                          </p>
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Display Mail & Password */}
                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 mb-3 space-y-1 text-[11px] font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3 h-3 text-slate-500" />
                            Mail:
                          </span>
                          <span className="text-emerald-300 font-semibold">{u.email}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Key className="w-3 h-3 text-slate-500" />
                            Password:
                          </span>
                          <span className="text-amber-300 font-semibold">{u.password || 'Admin@123'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLaunchRole(u.id)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          }`}
                        >
                          <span>{isCurrent ? 'Continue in Dashboard' : 'Launch Dashboard'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(u);
                          }}
                          title={`Delete & Decommission ${u.name}`}
                          className="p-2 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Register Custom Member / Role
                </h3>
                <p className="text-[11px] text-slate-400">
                  New users are immediately added to the organization and launched into their personalized dashboard.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Devon Vance"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Email Address (Mail) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g., devon.vance@taskforge.io"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Password <span className="text-emerald-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Default: Admin@123</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Job Title / Role <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g., Security Lead, Mobile Architect, QA Engineer"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Reports To (Manager / Placement in Hierarchy)
                  </label>
                  <select
                    value={managerId}
                    onChange={e => setManagerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  >
                    <option value="">— None (Top Executive Tier / Level 1) —</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role} (Level {u.hierarchyLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthTab('roles')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Back to Roles
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Register & Launch Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">TaskForge Hierarchical Engine</span>
            </div>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                resetToDefaultUsers();
                setSuccessMessage('Successfully reset all members & roles to default seed configuration!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              className="text-slate-400 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default Roles</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-slate-400 hover:text-white text-xs underline font-medium cursor-pointer"
          >
            Close & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
