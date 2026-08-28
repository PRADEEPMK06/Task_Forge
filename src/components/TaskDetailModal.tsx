import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus } from '../types';
import { 
  X, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Check, 
  Sliders, 
  MessageSquare, 
  History, 
  Calendar, 
  User, 
  Building2, 
  Sparkles,
  CheckSquare
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const { 
    selectedTaskId, 
    setSelectedTaskId, 
    tasks, 
    currentUser, 
    updateTaskProgress, 
    updateTaskStatus, 
    toggleChecklistItem, 
    addChecklistItem,
    addTaskComment, 
    approveTier, 
    rejectTier 
  } = useApp();

  const [commentInput, setCommentInput] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!selectedTaskId) return null;
  const task = tasks.find(t => t.id === selectedTaskId);
  if (!task) return null;

  // Check if currentUser is the active reviewer for the current pending tier
  const currentPendingTier = task.status === 'PENDING_APPROVAL' && task.approvalTiers[task.currentTierIndex];
  const canCurrentUserApprove = 
    currentPendingTier && 
    currentPendingTier.reviewerId === currentUser.id && 
    currentPendingTier.status === 'PENDING';

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addTaskComment(task.id, commentInput.trim());
    setCommentInput('');
  };

  const handleApprove = () => {
    approveTier(task.id, approvalComment.trim() || undefined);
    setApprovalComment('');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    rejectTier(task.id, rejectionReason.trim());
    setRejectionReason('');
    setShowRejectBox(false);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(task.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                TASK #{task.id}
              </span>
              
              {/* Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider ${
                task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                task.status === 'PENDING_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                task.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {task.status.replace('_', ' ')}
              </span>

              {/* Priority Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                task.priority === 'URGENT' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                task.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-slate-800 text-slate-300'
              }`}>
                {task.priority} Priority
              </span>

              {task.isCrossLevel && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Cross-Level Multi-Tier
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-white leading-snug">{task.title}</h2>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-slate-800/80">
          
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Creator</span>
              <p className="font-bold text-white mt-0.5">{task.creatorName}</p>
              <p className="text-[11px] text-slate-400">Level {task.creatorLevel} • {task.creatorRole}</p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Assignee</span>
              <p className="font-bold text-emerald-400 mt-0.5">{task.assigneeName}</p>
              <p className="text-[11px] text-slate-400">Level {task.assigneeLevel} • {task.assigneeRole}</p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Department</span>
              <p className="font-bold text-white mt-0.5">{task.department}</p>
              <p className="text-[11px] text-slate-400">Due: {task.dueDate}</p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Overall Progress</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-extrabold text-white font-mono">{task.progress}%</span>
                <span className="text-[10px] text-slate-400">{task.checklist.filter(i => i.completed).length}/{task.checklist.length} items</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Multi-Tier Approval Chain (If Cross Level or Approval Exists) */}
          {task.approvalTiers && task.approvalTiers.length > 0 && (
            <div className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Hierarchical Multi-Tier Approval Chain
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {task.approvalTiers.filter(t => t.status === 'APPROVED').length} / {task.approvalTiers.length} Approved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.approvalTiers.map((tier, idx) => {
                  const isCurrentPending = task.status === 'PENDING_APPROVAL' && idx === task.currentTierIndex;
                  return (
                    <div
                      key={tier.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        tier.status === 'APPROVED' ? 'bg-emerald-950/20 border-emerald-800/60' :
                        tier.status === 'REJECTED' ? 'bg-rose-950/20 border-rose-800/60' :
                        isCurrentPending ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40' :
                        'bg-slate-950 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          Tier {tier.tierNumber} Reviewer
                        </span>
                        <span className={`text-[10px] font-extrabold font-mono uppercase ${
                          tier.status === 'APPROVED' ? 'text-emerald-400' :
                          tier.status === 'REJECTED' ? 'text-rose-400' :
                          isCurrentPending ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                        }`}>
                          {tier.status === 'PENDING' && isCurrentPending ? '● Awaiting Review' : tier.status}
                        </span>
                      </div>

                      <p className="font-bold text-xs text-white">{tier.reviewerName}</p>
                      <p className="text-[11px] text-slate-400">{tier.reviewerRole} (Level {tier.reviewerLevel})</p>
                      
                      {tier.comments && (
                        <p className="text-[11px] text-slate-300 italic mt-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          "{tier.comments}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Managerial Review Action Banner if currentUser is active reviewer */}
              {canCurrentUserApprove && (
                <div className="bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/40 p-4 rounded-2xl space-y-3 mt-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Your Action Required (Tier {task.currentTierIndex + 1} Reviewer)
                    </span>
                  </div>

                  <input
                    type="text"
                    value={approvalComment}
                    onChange={e => setApprovalComment(e.target.value)}
                    placeholder="Optional approval note or instructions..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {showRejectBox ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="State reason for rejecting this task..."
                        className="w-full px-3.5 py-2 bg-slate-900 border border-rose-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowRejectBox(false)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReject}
                          className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowRejectBox(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                      >
                        Reject Task
                      </button>
                      <button
                        onClick={handleApprove}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve Tier {task.currentTierIndex + 1}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="pt-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Objectives & Scope
              </h3>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {task.description}
              </div>
            </div>
          )}

          {/* Interactive Progress & Status Workspace */}
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Interactive Progress & Status Control
              </h3>
              <div className="flex items-center gap-2">
                {(['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'BLOCKED'] as TaskStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => updateTaskStatus(task.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                      task.status === st
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Drag or select completion percentage:</span>
                <span className="text-base font-extrabold text-white font-mono">{task.progress}%</span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={task.progress}
                onChange={e => updateTaskProgress(task.id, parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center gap-2">
                {[0, 25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    onClick={() => updateTaskProgress(task.id, pct)}
                    className={`flex-1 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                      task.progress === pct
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Deliverables */}
          <div className="pt-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-400" />
              Key Milestones & Deliverables ({task.checklist.filter(i => i.completed).length}/{task.checklist.length})
            </h3>

            <div className="space-y-2">
              {task.checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(task.id, item.id)}
                  className="flex items-center gap-3 bg-slate-950 hover:bg-slate-950/80 p-3 rounded-xl border border-slate-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <span className={`text-xs ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.title}
                  </span>
                </div>
              ))}

              <form onSubmit={handleAddChecklist} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  placeholder="Add item..."
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Add Milestone
                </button>
              </form>
            </div>
          </div>

          {/* Discussion & Audit Log */}
          <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Discussion Feed */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Discussion Thread ({task.comments.length})
              </h3>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {task.comments.length > 0 ? (
                  task.comments.map(c => (
                    <div key={c.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-400">{c.authorName}</span>
                        <span className="text-slate-500">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                    No comments yet. Post the first update below.
                  </div>
                )}
              </div>

              <form onSubmit={handlePostComment} className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="Post comment as active user..."
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Audit History Log */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                Audit Trail & History
              </h3>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {task.activities.map(act => (
                  <div key={act.id} className="text-[11px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-200">{act.description}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {act.userName} • {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
