import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trash2, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  CheckSquare, 
  ShieldAlert, 
  X, 
  CheckCircle2 
} from 'lucide-react';

export const DeleteRoleModal: React.FC = () => {
  const { 
    userToDelete, 
    setUserToDelete, 
    deleteUser, 
    users, 
    getUserSubordinates, 
    tasks 
  } = useApp();

  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!userToDelete) return null;

  const target = userToDelete;
  const manager = users.find(u => u.id === target.managerId);
  const subordinates = getUserSubordinates(target.id);
  const userTasks = tasks.filter(t => t.assigneeId === target.id);
  const canDelete = users.length > 1;

  const handleDelete = () => {
    setIsDeleting(true);
    const result = deleteUser(target.id);
    if (result.success) {
      setFeedback(result.message);
      setTimeout(() => {
        setIsDeleting(false);
        setUserToDelete(null);
        setFeedback(null);
      }, 500);
    } else {
      setIsDeleting(false);
      setFeedback(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 border-red-500/20">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Delete & Decommission Role</h2>
              <p className="text-xs text-slate-400">Permanent removal from organizational hierarchy</p>
            </div>
          </div>

          <button
            onClick={() => setUserToDelete(null)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {feedback}
          </div>
        )}

        <div className="p-6 space-y-4">
          
          {/* Target Profile Card */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-white text-sm">
                L{target.hierarchyLevel}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {target.name}
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                    {target.department}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-medium">{target.role}</p>
                <p className="text-[11px] text-slate-500">{target.email}</p>
              </div>
            </div>
          </div>

          {/* Impact Overview */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Hierarchy & Task Impact Analysis
            </h4>

            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3.5 space-y-2.5 text-xs text-slate-300">
              
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Reporting Lines Re-routing: </span>
                  {subordinates.length > 0 ? (
                    <span>
                      <strong>{subordinates.length} direct report(s)</strong> ({subordinates.map(s => s.name).join(', ')}) will be safely re-assigned to report to{' '}
                      <strong className="text-emerald-400">{manager ? manager.name : 'Executive Root'}</strong>.
                    </span>
                  ) : (
                    <span>No subordinate reporting lines affected.</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Active Tasks: </span>
                  {userTasks.length > 0 ? (
                    <span>
                      <strong>{userTasks.length} task(s)</strong> currently assigned to {target.name} will be transferred to{' '}
                      <strong className="text-emerald-400">{manager ? manager.name : 'the Executive Admin'}</strong> to prevent workflow stoppage.
                    </span>
                  ) : (
                    <span>No active tasks require reassignment.</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Approval Chains: </span>
                  <span>Any in-flight cross-level approval tiers assigned to this role will be updated to their supervising manager.</span>
                </div>
              </div>

            </div>
          </div>

          {!canDelete && (
            <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-xl text-xs text-red-300">
              Cannot delete the only remaining user in the organization.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setUserToDelete(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canDelete || isDeleting}
              onClick={handleDelete}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Confirm Decommission & Delete'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
