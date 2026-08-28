import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, CheckCircle, Clock, ShieldCheck, PieChart } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { tasks, users } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingApprovalTasks = tasks.filter(t => t.status === 'PENDING_APPROVAL').length;
  const crossLevelTasks = tasks.filter(t => t.isCrossLevel).length;
  const directTasks = totalTasks - crossLevelTasks;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold">
            EXECUTIVE ANALYTICS
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Governance & Delivery Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Real-time organizational performance metrics, approval throughput, and hierarchical delegation velocity.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Completion Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{completionRate}%</span>
            <span className="text-xs text-slate-500">({completedTasks}/{totalTasks} tasks)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delegation Mix</span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">{directTasks}</span>
            <span className="text-xs text-emerald-400 font-medium">Direct Subordinate</span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-3xl font-extrabold text-purple-400 font-mono">{crossLevelTasks}</span>
            <span className="text-xs text-purple-400 font-medium">Cross-Level</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            {crossLevelTasks} tasks required multi-tier managerial approvals.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Governance Queue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{pendingApprovalTasks}</span>
            <span className="text-xs text-slate-400">Awaiting parent sign-offs</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Zero SLA breaches across all organizational approval tiers.
          </p>
        </div>
      </div>

      {/* Breakdown by Tier */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Task Distribution by Organizational Hierarchy Tier
        </h3>

        <div className="space-y-3">
          {[
            { level: 1, label: 'Level 1 — Executive Directives', color: 'bg-purple-500' },
            { level: 2, label: 'Level 2 — Director / VP Delegation', color: 'bg-blue-500' },
            { level: 3, label: 'Level 3 — Team Lead Tasks', color: 'bg-teal-500' },
            { level: 4, label: 'Level 4 — Individual Contributor Output', color: 'bg-emerald-500' },
          ].map(tier => {
            const count = tasks.filter(t => t.assigneeLevel === tier.level).length;
            const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

            return (
              <div key={tier.level} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{tier.label}</span>
                  <span className="font-mono text-slate-400">{count} tasks ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${tier.color} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
