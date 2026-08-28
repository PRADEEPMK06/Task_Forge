import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  Sparkles,
  ArrowRight,
  User,
  Calendar
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { tasks, currentUser, approveTier, rejectTier, setSelectedTaskId } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'PENDING_MY_REVIEW' | 'ALL_PENDING' | 'HISTORY'>('PENDING_MY_REVIEW');
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [rejectingTaskId, setRejectingTaskId] = useState<number | null>(null);

  // Filter tasks waiting specifically for current user
  const myPendingReviewTasks = tasks.filter(t => {
    if (t.status !== 'PENDING_APPROVAL') return false;
    const currentTier = t.approvalTiers[t.currentTierIndex];
    return currentTier && currentTier.reviewerId === currentUser.id && currentTier.status === 'PENDING';
  });

  const allPendingTasks = tasks.filter(t => t.status === 'PENDING_APPROVAL');

  const historyTasks = tasks.filter(t => 
    t.approvalTiers.some(tier => tier.reviewerId === currentUser.id && tier.status !== 'PENDING')
  );

  const displayedTasks = 
    activeSubTab === 'PENDING_MY_REVIEW' ? myPendingReviewTasks :
    activeSubTab === 'ALL_PENDING' ? allPendingTasks :
    historyTasks;

  const handleApprove = (taskId: number) => {
    const comment = commentInputs[taskId];
    approveTier(taskId, comment?.trim() || undefined);
    setCommentInputs(prev => ({ ...prev, [taskId]: '' }));
  };

  const handleReject = (taskId: number) => {
    const reason = rejectionReasons[taskId];
    if (!reason || !reason.trim()) return;
    rejectTier(taskId, reason.trim());
    setRejectionReasons(prev => ({ ...prev, [taskId]: '' }));
    setRejectingTaskId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-mono font-bold">
                MANAGERIAL GOVERNANCE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hierarchical Approvals Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review and authorize cross-level task assignments traversing your organizational reporting chain.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-slate-300">
              Active Tier: <strong className="text-emerald-400">Level {currentUser.hierarchyLevel}</strong>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveSubTab('PENDING_MY_REVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'PENDING_MY_REVIEW'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting My Review ({myPendingReviewTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ALL_PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ALL_PENDING'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>All Organization Pending ({allPendingTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'HISTORY'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reviewed History ({historyTasks.length})</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {displayedTasks.map(task => {
          const currentTier = task.approvalTiers[task.currentTierIndex];
          const isMyTurn = currentTier && currentTier.reviewerId === currentUser.id && currentTier.status === 'PENDING';

          return (
            <div
              key={task.id}
              className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition-all ${
                isMyTurn ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                {/* Left Meta */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      TASK #{task.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      Cross-Level Delegation
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      Tier {task.currentTierIndex + 1} of {task.approvalTiers.length} Active
                    </span>
                  </div>

                  <h3 
                    onClick={() => setSelectedTaskId(task.id)}
                    className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span>From: <strong className="text-slate-200">{task.creatorName}</strong> ({task.creatorRole})</span>
                    <span>To: <strong className="text-emerald-400">{task.assigneeName}</strong> ({task.assigneeRole})</span>
                    <span>Department: <strong className="text-slate-200">{task.department}</strong></span>
                  </div>

                  {/* Multi-Tier Chain Progress */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                      Sequential Approval Progression:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.approvalTiers.map((tier, idx) => (
                        <div
                          key={tier.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                            tier.status === 'APPROVED' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' :
                            tier.status === 'REJECTED' ? 'bg-rose-950/40 border-rose-800 text-rose-300' :
                            idx === task.currentTierIndex ? 'bg-amber-950/50 border-amber-500 text-amber-300 animate-pulse' :
                            'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold">
                            {tier.tierNumber}
                          </span>
                          <span>{tier.reviewerName}</span>
                          <span className="text-[10px] uppercase font-bold">
                            [{tier.status === 'PENDING' && idx === task.currentTierIndex ? 'Current' : tier.status}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Box (If My Turn to Approve) */}
                {isMyTurn && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 lg:w-80 space-y-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Your Decision as Tier {task.currentTierIndex + 1} Reviewer</span>
                    </div>

                    <input
                      type="text"
                      value={commentInputs[task.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [task.id]: e.target.value })}
                      placeholder="Approval note (optional)..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    {rejectingTaskId === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={rejectionReasons[task.id] || ''}
                          onChange={e => setRejectionReasons({ ...rejectionReasons, [task.id]: e.target.value })}
                          placeholder="Reason for rejection..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-rose-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setRejectingTaskId(null)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(task.id)}
                            className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectingTaskId(task.id)}
                          className="px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex-1"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(task.id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 flex-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {displayedTasks.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Clear! No pending approvals</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no cross-level tasks waiting in this queue.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
