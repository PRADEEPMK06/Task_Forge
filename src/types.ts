export type HierarchyLevel = 1 | 2 | 3 | 4;

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  department: string;
  managerId: number | null;
  hierarchyLevel: HierarchyLevel;
  avatarUrl?: string;
  password?: string;
}

export type TaskStatus = 
  | 'PENDING_APPROVAL'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'REJECTED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ApprovalTier {
  id: string;
  tierNumber: number;
  reviewerId: number;
  reviewerName: string;
  reviewerRole: string;
  reviewerLevel: HierarchyLevel;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  comments?: string;
}

export interface TaskComment {
  id: string;
  authorId: number;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskActivity {
  id: string;
  type: 'CREATED' | 'STATUS_CHANGE' | 'PROGRESS_UPDATE' | 'APPROVAL' | 'REJECTION' | 'COMMENT';
  userId: number;
  userName: string;
  description: string;
  timestamp: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  creatorName: string;
  creatorRole: string;
  creatorLevel: HierarchyLevel;
  assigneeId: number;
  assigneeName: string;
  assigneeRole: string;
  assigneeLevel: HierarchyLevel;
  department: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0 - 100
  dueDate: string;
  createdAt: string;
  isCrossLevel: boolean;
  approvalTiers: ApprovalTier[];
  currentTierIndex: number;
  comments: TaskComment[];
  checklist: TaskChecklistItem[];
  activities: TaskActivity[];
}

export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  taskId?: number;
  type: 'TASK_ASSIGNED' | 'APPROVAL_REQUIRED' | 'TASK_APPROVED' | 'TASK_REJECTED' | 'COMMENT_ADDED';
  read: boolean;
  createdAt: string;
}
