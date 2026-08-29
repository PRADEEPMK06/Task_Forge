import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TaskDashboard } from './components/TaskDashboard';
import { ApprovalsView } from './components/ApprovalsView';
import { HierarchyView } from './components/HierarchyView';
import { TeamDirectory } from './components/TeamDirectory';
import { ReportsView } from './components/ReportsView';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { PrototypeAuth } from './components/PrototypeAuth';
import { DeleteRoleModal } from './components/DeleteRoleModal';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    showCreateModal,
    selectedTaskId,
    showAuthModal,
    userToDelete
  } = useApp();

  const pageTitles: Record<string, string> = {
    tasks: 'Task Management Dashboard',
    approvals: 'Task Approvals',
    hierarchy: 'Organizational Hierarchy',
    team: 'Team Directory',
    reports: 'Task Reports and Analytics'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">

      {/* Top Persistent Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* SEO: Primary page heading */}
        <h1 className="sr-only">
          {pageTitles[activeTab] || 'TaskForge Enterprise Task Management'}
        </h1>

        {activeTab === 'tasks' && <TaskDashboard />}
        {activeTab === 'approvals' && <ApprovalsView />}
        {activeTab === 'hierarchy' && <HierarchyView />}
        {activeTab === 'team' && <TeamDirectory />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Modals & Overlays */}
      {showCreateModal && <CreateTaskModal />}
      {selectedTaskId && <TaskDetailModal />}
      {showAuthModal && <PrototypeAuth />}
      {userToDelete && <DeleteRoleModal />}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskForge Enterprise • Hierarchical Task Governance</span>
          <span className="font-mono text-[11px] text-slate-600">
            Prototype Environment • Port 3000
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}