import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskPriority } from '../types';
import { X, Plus, Trash2, Shield, UserCheck, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

export const CreateTaskModal: React.FC = () => {
  const { 
    currentUser, 
    users, 
    getUserSubordinates, 
    getParentHierarchyChain,
    createTask, 
    setShowCreateModal, 
    setSelectedTaskId 
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<number>(() => {
    const directSubs = getUserSubordinates(currentUser.id);
    return directSubs.length > 0 ? directSubs[0].id : (users.find(u => u.id !== currentUser.id)?.id || currentUser.id);
  });
  const [department, setDepartment] = useState('Engineering');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [checklist, setChecklist] = useState<string[]>(['Initial technical design review', 'Implementation & testing']);
  const [newChecklistText, setNewChecklistText] = useState('');

  const directSubordinates = getUserSubordinates(currentUser.id);
  const selectedAssignee = users.find(u => u.id === assigneeId);

  // Check if selected assignee is direct subordinate or self or cross-level
  const isDirectSubordinate = directSubordinates.some(s => s.id === assigneeId);
  const isSelf = currentUser.id === assigneeId;
  const isExecutive = currentUser.hierarchyLevel === 1;
  const isCrossLevel = !isExecutive && !isDirectSubordinate && !isSelf;

  const parentApprovalChain = isCrossLevel ? getParentHierarchyChain(currentUser.id) : [];

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([...checklist, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;

    const task = createTask({
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      department,
      priority,
      dueDate,
      checklist,
    });

    setShowCreateModal(false);
    setSelectedTaskId(task.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Create Hierarchical Task</h2>
              <p className="text-xs text-slate-400">
                Created as <strong className="text-emerald-400">{currentUser.name}</strong> (Level {currentUser.hierarchyLevel} • {currentUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Task Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Deliver Production Telemetry & Sentry Integration"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Objectives
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline objectives, acceptance criteria, and expected deliverables..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium resize-none"
            />
          </div>

          {/* Assignee Selection with Hierarchy Classification */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Assignee (Delegation Target) <span className="text-emerald-400">*</span>
            </label>
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs font-medium"
            >
              {directSubordinates.length > 0 && (
                <optgroup label="Direct Subordinates (Instant Direct Assignment)">
                  {directSubordinates.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      ⚡ {sub.name} — {sub.role} (Level {sub.hierarchyLevel}) [Immediate]
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Cross-Level / Leadership / Other Teams (Requires Managerial Multi-Tier Sign-Off)">
                {users
                  .filter(u => !directSubordinates.some(d => d.id === u.id))
                  .map(other => (
                    <option key={other.id} value={other.id}>
                      🔒 {other.name} — {other.role} (Level {other.hierarchyLevel})
                    </option>
                  ))}
              </optgroup>
            </select>

            {/* Smart Delegation Policy Banner */}
            {selectedAssignee && (
              <div className="rounded-2xl p-4 border text-xs transition-all">
                {isExecutive ? (
                  <div className="flex items-start gap-2.5 bg-purple-950/20 border-purple-800/40 text-purple-300">
                    <UserCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-200">Executive Directive: </span>
                      As Level 1 Executive, tasks are assigned directly with immediate dispatch across any department.
                    </div>
                  </div>
                ) : isDirectSubordinate || isSelf ? (
                  <div className="flex items-start gap-2.5 bg-emerald-950/20 border-emerald-800/40 text-emerald-300">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-200">Direct Subordinate Delegation: </span>
                      {selectedAssignee.name} reports directly to you. This task will be assigned immediately with <strong className="text-emerald-400 font-mono">Status: ASSIGNED</strong> without requiring approval tiers.
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-950/30 border-amber-800/50 text-amber-300 p-3.5 rounded-xl space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-200">Cross-Level Task Workflow: </span>
                        {selectedAssignee.name} is outside your direct reporting line. This task will be set to <strong className="text-amber-400 font-mono">PENDING_APPROVAL</strong> and will automatically require sequential approval from your management chain:
                      </div>
                    </div>
                    
                    {/* Approval Chain Preview */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/50 space-y-1.5 font-mono text-[11px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block mb-1">
                        Generated Parent Approval Chain:
                      </span>
                      {parentApprovalChain.map((parent, idx) => (
                        <div key={parent.id} className="flex items-center gap-2 text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-white font-bold">{parent.name}</span>
                          <span className="text-slate-400">({parent.role} • Level {parent.hierarchyLevel})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Department, Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Executive">Executive</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent / Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>
          </div>

          {/* Checklist / Deliverables */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Checklist / Key Deliverables
            </label>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-200">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklist(idx)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist();
                    }
                  }}
                  placeholder="Add a milestone or checklist item..."
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Dispatch Task</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
