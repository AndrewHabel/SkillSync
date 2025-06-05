import { TaskStatus } from "@/features/tasks/types";

interface Task {
  $id: string;
  status: TaskStatus;
  dueDate?: string | null;
  estimatedHours?: number;
}

export const calculatePerformanceScore = (tasks: Task[] | undefined): {
  performanceScore: number;
  completionScore: number;
  activeTasksScore: number;
  onTimeScore: number;
  completedTasksCount: number;
  activeTasksCount: number;
  overdueTasksCount: number;
  totalTasksCount: number;
} => {
  if (!tasks || tasks.length === 0) {
    return {
      performanceScore: 0,
      completionScore: 0,
      activeTasksScore: 0,
      onTimeScore: 0,
      completedTasksCount: 0,
      activeTasksCount: 0,
      overdueTasksCount: 0,
      totalTasksCount: 0
    };
  }

  const today = new Date();
  const totalTasksCount = tasks.length;

  // Identify overdue tasks
  const overdueTasksCount = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }).length;

  // Filter active tasks (not done and not overdue)
  const activeTasksCount = tasks.filter(task => {
    // Exclude completed tasks
    if (task.status === TaskStatus.DONE) return false;
    
    // Exclude overdue tasks
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate < today) return false;
    }
    
    return true;
  }).length;

  // Filter completed tasks (only those that aren't overdue)
  const completedTasksCount = tasks.filter(task => 
    task.status === TaskStatus.DONE && (!task.dueDate || new Date(task.dueDate) >= today)
  ).length;

  // Calculate individual score components
  const completionScore = (completedTasksCount / totalTasksCount) * 50;
  const activeTasksScore = (activeTasksCount / totalTasksCount) * 30;
  const onTimeScore = ((totalTasksCount - overdueTasksCount) / totalTasksCount) * 20;
  
  // Calculate the overall performance score (rounded to 1 decimal place)
  const performanceScore = Math.round((completionScore + activeTasksScore + onTimeScore) * 10) / 10;

  return {
    performanceScore,
    completionScore,
    activeTasksScore,
    onTimeScore,
    completedTasksCount,
    activeTasksCount,
    overdueTasksCount,
    totalTasksCount
  };
};
