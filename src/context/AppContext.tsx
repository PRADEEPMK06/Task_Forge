import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, Notification, HierarchyLevel, ApprovalTier, TaskStatus, TaskPriority } from '../types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_NOTIFICATIONS } from '../data/initialData';

interface AppContextType {
  currentUser: User;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  activeTab: 'tasks' | 'approvals' | 'hierarchy' | 'team' | 'reports';
  showAuthModal: boolean;
  selectedTaskId: number | null;
  showCreateModal: boolean;
  
  // Navigation & Modals
  setActiveTab: (tab: 'tasks' | 'approvals' | 'hierarchy' | 'team' | 'reports') => void;
  setShowAuthModal: (show: boolean) => void;
  setSelectedTaskId: (id: number | null) => void;
  setShowCreateModal: (show: boolean) => void;
  
  // Auth & Roles
  switchUser: (userId: number) => void;
  registerUser: (name: string, email: string, password: string, role: string, managerId: number | null) => User;
  deleteUser: (userId: number) => { success: boolean; message: string };
  resetToDefaultUsers: () => void;
  userToDelete: User | null;
  setUserToDelete: (user: User | null) => void;
  
  // Tasks & Approvals
  createTask: (data: {
    title: string;
    description: string;
    assigneeId: number;
    department: string;
    priority: TaskPriority;
    dueDate: string;
    checklist?: string[];
  }) => Task;
  updateTaskProgress: (taskId: number, progress: number) => void;
  updateTaskStatus: (taskId: number, status: TaskStatus) => void;
  toggleChecklistItem: (taskId: number, itemId: string) => void;
  addChecklistItem: (taskId: number, title: string) => void;
  addTaskComment: (taskId: number, content: string) => void;
  approveTier: (taskId: number, comments?: string) => void;
  rejectTier: (taskId: number, comments: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  
  // Hierarchy Helpers
  getUserSubordinates: (userId: number) => User[];
  getAllDescendants: (userId: number) => User[];
  getParentHierarchyChain: (userId: number) => User[];
  canUserCreateTasks: (userId: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('taskforge_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<number>(() => {
    const saved = localStorage.getItem('taskforge_current_user_id');
    return saved ? JSON.parse(saved) : 1; // Default to Admin
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskforge_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('taskforge_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'approvals' | 'hierarchy' | 'team' | 'reports'>('tasks');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('taskforge_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('taskforge_current_user_id', JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('taskforge_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskforge_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Hierarchy calculations
  const getUserSubordinates = (userId: number): User[] => {
    return users.filter(u => u.managerId === userId);
  };

  const getAllDescendants = (userId: number): User[] => {
    const direct = users.filter(u => u.managerId === userId);
    let all = [...direct];
    for (const child of direct) {
      all = all.concat(getAllDescendants(child.id));
    }
    return all;
  };

  const getParentHierarchyChain = (userId: number): User[] => {
    const chain: User[] = [];
    let current = users.find(u => u.id === userId);
    while (current && current.managerId) {
      const mgr = users.find(u => u.id === current?.managerId);
      if (mgr && !chain.some(item => item.id === mgr.id)) {
        chain.push(mgr);
        current = mgr;
      } else {
        break;
      }
    }
    return chain;
  };

  const canUserCreateTasks = (userId: number): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    if (user.hierarchyLevel === 1) return true;
    const directSubs = getUserSubordinates(userId);
    return directSubs.length > 0 || user.hierarchyLevel <= 3;
  };

  const switchUser = (userId: number) => {
    setCurrentUserId(userId);
    setShowAuthModal(false);
  };

  const registerUser = (
    name: string,
    email: string,
    password: string,
    role: string,
    managerId: number | null
  ): User => {
    const manager = users.find(u => u.id === managerId);
    let level: HierarchyLevel = 4;
    if (!manager) {
      level = 1;
    } else if (manager.hierarchyLevel === 1) {
      level = 2;
    } else if (manager.hierarchyLevel === 2) {
      level = 3;
    } else {
      level = 4;
    }

    const newUser: User = {
      id: Date.now(),
      username: email.split('@')[0] || `user_${Date.now()}`,
      email,
      name,
      role,
      department: manager?.department || 'Engineering',
      managerId,
      hierarchyLevel: level,
      password: password || 'Admin@123',
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setShowAuthModal(false);
    return newUser;
  };

  const deleteUser = (userId: number): { success: boolean; message: string } => {
    if (users.length <= 1) {
      return { success: false, message: 'Cannot delete the only member in the organization.' };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Role or user not found.' };
    }

    const fallbackManagerId = targetUser.managerId;
    const fallbackManager = fallbackManagerId ? users.find(u => u.id === fallbackManagerId) : null;

    // Switch active session if the deleted user is the current session
    let nextUserId = currentUserId;
    if (currentUserId === userId) {
      if (fallbackManager) {
        nextUserId = fallbackManager.id;
      } else {
        const remaining = users.filter(u => u.id !== userId);
        nextUserId = remaining[0]?.id || 1;
      }
      setCurrentUserId(nextUserId);
    }

    // Re-link direct subordinates to the deleted user's manager
    const updatedUsers = users
      .filter(u => u.id !== userId)
      .map(u => {
        if (u.managerId === userId) {
          let newLevel: HierarchyLevel = u.hierarchyLevel;
          if (!fallbackManager) {
            newLevel = 1;
          } else {
            newLevel = Math.min(4, Math.max(1, fallbackManager.hierarchyLevel + 1)) as HierarchyLevel;
          }
          return {
            ...u,
            managerId: fallbackManagerId,
            hierarchyLevel: newLevel,
          };
        }
        return u;
      });

    setUsers(updatedUsers);

    // Update tasks and reassign or clean up
    const fallbackAssignee = fallbackManager || updatedUsers.find(u => u.id === nextUserId) || updatedUsers[0];

    setTasks(prevTasks =>
      prevTasks.map(task => {
        let updatedTask = { ...task };

        // If deleted user was assignee, reassign safely
        if (task.assigneeId === userId && fallbackAssignee) {
          updatedTask.assigneeId = fallbackAssignee.id;
          updatedTask.assigneeName = fallbackAssignee.name;
          updatedTask.assigneeRole = fallbackAssignee.role;
          updatedTask.assigneeLevel = fallbackAssignee.hierarchyLevel;
          updatedTask.activities = [
            ...updatedTask.activities,
            {
              id: `act_${Date.now()}_del`,
              type: 'STATUS_CHANGE',
              userId: nextUserId,
              userName: updatedUsers.find(u => u.id === nextUserId)?.name || 'System',
              description: `Previous assignee ${targetUser.name} (${targetUser.role}) was deleted from the organization. Task automatically reassigned to ${fallbackAssignee.name}.`,
              timestamp: new Date().toISOString(),
            },
          ];
        }

        // If deleted user was creator, annotate as archived
        if (task.creatorId === userId) {
          updatedTask.creatorName = `${targetUser.name} (Archived Role)`;
        }

        // If deleted user is an active reviewer in approval tiers
        if (task.approvalTiers.some(t => t.reviewerId === userId)) {
          const updatedTiers = task.approvalTiers.map(tier => {
            if (tier.reviewerId === userId) {
              if (fallbackManager) {
                return {
                  ...tier,
                  reviewerId: fallbackManager.id,
                  reviewerName: fallbackManager.name,
                  reviewerRole: fallbackManager.role,
                  reviewerLevel: fallbackManager.hierarchyLevel,
                  comments: tier.comments ? `${tier.comments} (Role updated to ${fallbackManager.name})` : undefined,
                };
              } else {
                return {
                  ...tier,
                  status: 'APPROVED' as const,
                  comments: 'Auto-approved upon role decommission',
                  reviewedAt: new Date().toISOString(),
                };
              }
            }
            return tier;
          });
          updatedTask.approvalTiers = updatedTiers;
        }

        return updatedTask;
      })
    );

    // Clean up notifications for deleted user
    setNotifications(prev => prev.filter(n => n.userId !== userId));

    // Send confirmation notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}_del`,
        userId: nextUserId,
        title: 'Role Successfully Deleted',
        message: `Role "${targetUser.name}" (${targetUser.role}) was removed from the organization. Subordinates and tasks were re-routed.`,
        type: 'TASK_APPROVED',
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setUserToDelete(null);

    return {
      success: true,
      message: `Role "${targetUser.name}" (${targetUser.role}) has been successfully deleted.`,
    };
  };

  const resetToDefaultUsers = () => {
    setUsers(INITIAL_USERS);
    setTasks(INITIAL_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUserId(1);
    setUserToDelete(null);
    localStorage.removeItem('taskforge_users');
    localStorage.removeItem('taskforge_tasks');
    localStorage.removeItem('taskforge_notifications');
    localStorage.removeItem('taskforge_current_user_id');
  };

  const createTask = (data: {
    title: string;
    description: string;
    assigneeId: number;
    department: string;
    priority: TaskPriority;
    dueDate: string;
    checklist?: string[];
  }): Task => {
    const assignee = users.find(u => u.id === data.assigneeId);
    if (!assignee) throw new Error('Assignee not found');

    const directSubs = getUserSubordinates(currentUser.id);
    const isDirectSubordinate = directSubs.some(s => s.id === assignee.id);
    const isSelf = currentUser.id === assignee.id;

    let isCrossLevel = false;
    let approvalTiers: ApprovalTier[] = [];
    let initialStatus: TaskStatus = 'ASSIGNED';

    if (currentUser.hierarchyLevel === 1) {
      isCrossLevel = false;
      initialStatus = 'ASSIGNED';
    } else if (isDirectSubordinate || isSelf) {
      isCrossLevel = false;
      initialStatus = 'ASSIGNED';
    } else {
      // Cross-level assignment: parent approval chain needed
      isCrossLevel = true;
      initialStatus = 'PENDING_APPROVAL';
      const parentChain = getParentHierarchyChain(currentUser.id);
      approvalTiers = parentChain.map((parent, idx) => ({
        id: `tier_${Date.now()}_${idx}`,
        tierNumber: idx + 1,
        reviewerId: parent.id,
        reviewerName: parent.name,
        reviewerRole: parent.role,
        reviewerLevel: parent.hierarchyLevel,
        status: 'PENDING',
      }));
    }

    const newTask: Task = {
      id: Date.now(),
      title: data.title,
      description: data.description,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      creatorLevel: currentUser.hierarchyLevel,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      assigneeRole: assignee.role,
      assigneeLevel: assignee.hierarchyLevel,
      department: data.department || assignee.department,
      priority: data.priority,
      status: initialStatus,
      progress: 0,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      isCrossLevel,
      approvalTiers,
      currentTierIndex: 0,
      checklist: (data.checklist || []).map((item, i) => ({
        id: `cl_${Date.now()}_${i}`,
        title: item,
        completed: false,
      })),
      comments: [],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: 'CREATED',
          userId: currentUser.id,
          userName: currentUser.name,
          description: isCrossLevel
            ? `Created cross-level task assigned to ${assignee.name}. Generated ${approvalTiers.length}-tier approval chain.`
            : `Created and assigned task directly to ${assignee.name}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setTasks(prev => [newTask, ...prev]);

    // Send notifications
    if (isCrossLevel && approvalTiers.length > 0) {
      const firstReviewer = approvalTiers[0];
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          userId: firstReviewer.reviewerId,
          title: `Approval Required: ${newTask.title.slice(0, 40)}...`,
          message: `${currentUser.name} assigned cross-level task to ${assignee.name}. Tier 1 Approval requested.`,
          taskId: newTask.id,
          type: 'APPROVAL_REQUIRED',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          userId: assignee.id,
          title: 'New Task Assigned',
          message: `${currentUser.name} assigned you "${newTask.title}"`,
          taskId: newTask.id,
          type: 'TASK_ASSIGNED',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    return newTask;
  };

  const updateTaskProgress = (taskId: number, progress: number) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const newProgress = Math.min(100, Math.max(0, progress));
        let newStatus = task.status;
        if (newProgress === 100 && task.status !== 'COMPLETED') {
          newStatus = 'COMPLETED';
        } else if (newProgress > 0 && task.status === 'ASSIGNED') {
          newStatus = 'IN_PROGRESS';
        }
        return {
          ...task,
          progress: newProgress,
          status: newStatus,
          activities: [
            ...task.activities,
            {
              id: `act_${Date.now()}`,
              type: 'PROGRESS_UPDATE',
              userId: currentUser.id,
              userName: currentUser.name,
              description: `Updated progress to ${newProgress}%${newStatus === 'COMPLETED' ? ' (Task marked as Completed)' : ''}`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const updateTaskStatus = (taskId: number, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          status,
          activities: [
            ...task.activities,
            {
              id: `act_${Date.now()}`,
              type: 'STATUS_CHANGE',
              userId: currentUser.id,
              userName: currentUser.name,
              description: `Changed status to ${status.replace('_', ' ')}`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const toggleChecklistItem = (taskId: number, itemId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const updatedChecklist = task.checklist.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const completedCount = updatedChecklist.filter(i => i.completed).length;
        const calculatedProgress =
          updatedChecklist.length > 0 ? Math.round((completedCount / updatedChecklist.length) * 100) : task.progress;
        return {
          ...task,
          checklist: updatedChecklist,
          progress: calculatedProgress,
          status: calculatedProgress === 100 ? 'COMPLETED' : task.status,
        };
      })
    );
  };

  const addChecklistItem = (taskId: number, title: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          checklist: [...task.checklist, { id: `cl_${Date.now()}`, title, completed: false }],
        };
      })
    );
  };

  const addTaskComment = (taskId: number, content: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          comments: [
            ...task.comments,
            {
              id: `cm_${Date.now()}`,
              authorId: currentUser.id,
              authorName: currentUser.name,
              authorRole: currentUser.role,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
          activities: [
            ...task.activities,
            {
              id: `act_${Date.now()}`,
              type: 'COMMENT',
              userId: currentUser.id,
              userName: currentUser.name,
              description: `Commented: "${content.slice(0, 50)}..."`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const approveTier = (taskId: number, comments?: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const tiers = [...task.approvalTiers];
        const currentIdx = task.currentTierIndex;
        if (currentIdx >= tiers.length) return task;

        tiers[currentIdx] = {
          ...tiers[currentIdx],
          status: 'APPROVED',
          reviewedAt: new Date().toISOString(),
          comments,
        };

        const nextIdx = currentIdx + 1;
        const allApproved = nextIdx >= tiers.length;
        const newStatus: TaskStatus = allApproved ? 'ASSIGNED' : 'PENDING_APPROVAL';

        // Notify next reviewer or assignee
        if (!allApproved) {
          const nextReviewer = tiers[nextIdx];
          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              userId: nextReviewer.reviewerId,
              title: `Approval Required: ${task.title.slice(0, 40)}...`,
              message: `${currentUser.name} approved Tier ${currentIdx + 1}. Tier ${nextIdx + 1} Approval now requested.`,
              taskId: task.id,
              type: 'APPROVAL_REQUIRED',
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...n,
          ]);
        } else {
          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              userId: task.assigneeId,
              title: 'Task Fully Approved & Dispatched',
              message: `Cross-level task "${task.title}" has been approved by all tiers and is now active on your dashboard!`,
              taskId: task.id,
              type: 'TASK_APPROVED',
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...n,
          ]);
        }

        return {
          ...task,
          approvalTiers: tiers,
          currentTierIndex: nextIdx,
          status: newStatus,
          activities: [
            ...task.activities,
            {
              id: `act_${Date.now()}`,
              type: 'APPROVAL',
              userId: currentUser.id,
              userName: currentUser.name,
              description: `Approved Tier ${currentIdx + 1}${allApproved ? ' (All tiers approved - Task Dispatched!)' : ''}${comments ? `: "${comments}"` : ''}`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const rejectTier = (taskId: number, comments: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const tiers = [...task.approvalTiers];
        const currentIdx = task.currentTierIndex;
        if (currentIdx < tiers.length) {
          tiers[currentIdx] = {
            ...tiers[currentIdx],
            status: 'REJECTED',
            reviewedAt: new Date().toISOString(),
            comments,
          };
        }

        setNotifications(n => [
          {
            id: `notif_${Date.now()}`,
            userId: task.creatorId,
            title: 'Task Rejected',
            message: `${currentUser.name} rejected task "${task.title}". Reason: ${comments}`,
            taskId: task.id,
            type: 'TASK_REJECTED',
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...n,
        ]);

        return {
          ...task,
          approvalTiers: tiers,
          status: 'REJECTED',
          activities: [
            ...task.activities,
            {
              id: `act_${Date.now()}`,
              type: 'REJECTION',
              userId: currentUser.id,
              userName: currentUser.name,
              description: `Rejected Tier ${currentIdx + 1}: "${comments}"`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tasks,
        notifications,
        activeTab,
        showAuthModal,
        selectedTaskId,
        showCreateModal,
        setActiveTab,
        setShowAuthModal,
        setSelectedTaskId,
        setShowCreateModal,
        switchUser,
        registerUser,
        deleteUser,
        resetToDefaultUsers,
        userToDelete,
        setUserToDelete,
        createTask,
        updateTaskProgress,
        updateTaskStatus,
        toggleChecklistItem,
        addChecklistItem,
        addTaskComment,
        approveTier,
        rejectTier,
        markNotificationRead,
        markAllNotificationsRead,
        getUserSubordinates,
        getAllDescendants,
        getParentHierarchyChain,
        canUserCreateTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
