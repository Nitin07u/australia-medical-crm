import { Task, TaskPriority, TaskStatus } from '../types';
import { getAllLeads, updateLead } from './leadService';

export function getAllTasks(): { task: Task; businessName: string; businessId: string; state: string }[] {
  const leads = getAllLeads();
  const tasksList: { task: Task; businessName: string; businessId: string; state: string }[] = [];

  leads.forEach(l => {
    l.tasks.forEach(t => {
      tasksList.push({
        task: t,
        businessName: l.business.business_name,
        businessId: l.business.id,
        state: l.business.state
      });
    });
  });

  return tasksList.sort((a, b) => {
    if (a.task.status === 'Completed' && b.task.status !== 'Completed') return 1;
    if (a.task.status !== 'Completed' && b.task.status === 'Completed') return -1;
    if (!a.task.due_date) return 1;
    if (!b.task.due_date) return -1;
    return new Date(a.task.due_date).getTime() - new Date(b.task.due_date).getTime();
  });
}

export function addTask(
  businessId: string, 
  data: { title: string; description?: string; due_date?: string; priority: TaskPriority }
): Task | null {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return null;

  const timestamp = new Date().toISOString();
  const newTask: Task = {
    id: `task-${Date.now()}`,
    business_id: businessId,
    title: data.title,
    description: data.description,
    due_date: data.due_date,
    priority: data.priority,
    status: 'Pending',
    created_at: timestamp,
    updated_at: timestamp
  };

  const tasks = [newTask, ...found.tasks];
  const activities = [
    {
      id: `act-${Date.now()}`,
      business_id: businessId,
      activity_type: 'task_created' as const,
      description: `Task created: "${newTask.title}"`,
      user_name: 'You',
      created_at: timestamp
    },
    ...found.activities
  ];

  updateLead(businessId, { tasks, activities });
  return newTask;
}

export function updateTaskStatus(businessId: string, taskId: string, status: TaskStatus): boolean {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return false;

  const timestamp = new Date().toISOString();
  let taskTitle = '';
  const updatedTasks = found.tasks.map(t => {
    if (t.id === taskId) {
      taskTitle = t.title;
      return { ...t, status, updated_at: timestamp };
    }
    return t;
  });

  const activities = [...found.activities];
  if (status === 'Completed') {
    activities.unshift({
      id: `act-${Date.now()}`,
      business_id: businessId,
      activity_type: 'task_completed' as const,
      description: `Task completed: "${taskTitle}"`,
      user_name: 'You',
      created_at: timestamp
    });
  }

  updateLead(businessId, { tasks: updatedTasks, activities });
  return true;
}

export function deleteTask(businessId: string, taskId: string): boolean {
  const leads = getAllLeads();
  const found = leads.find(l => l.business.id === businessId);
  if (!found) return false;

  const filtered = found.tasks.filter(t => t.id !== taskId);
  updateLead(businessId, { tasks: filtered });
  return true;
}
