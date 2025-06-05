import { TaskStatus } from "@/features/tasks/types";

interface Task {
  $id: string;
  status: TaskStatus;
  dueDate?: string | null;
  estimatedHours?: number;
}

/**
 * Calculate member workload summary based on task statuses and estimated hours
 */
export const calculateWorkloadSummary = (tasks: Task[] | undefined) => {
  if (!tasks || tasks.length === 0) {
    return {
      totalEstimatedHours: 0,
      workloadByStatus: {
        todo: 0,
        inProgress: 0,
        inReview: 0,
        overdue: 0
      },
      statusCounts: {
        todo: 0,
        inProgress: 0,
        inReview: 0,
        done: 0,
        overdue: 0
      }
    };
  }

  const today = new Date();

  // Identify overdue tasks - tasks with due date before current date (including completed ones)
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  });

  // Count tasks by status
  const statusCounts = {
    todo: tasks.filter(task => task.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
    inReview: tasks.filter(task => task.status === TaskStatus.IN_REVIEW).length,
    done: tasks.filter(task => 
      task.status === TaskStatus.DONE && (!task.dueDate || new Date(task.dueDate) >= today)
    ).length,
    overdue: overdueTasks.length,
  };

  // Calculate total workload in hours (excluding done tasks)
  const totalEstimatedHours = tasks
    .filter(task => task.status !== TaskStatus.DONE) // Exclude done tasks
    .reduce((total, task) => {
      return total + (task.estimatedHours || 0);
    }, 0);

  // Calculate workload by status (only active tasks)
  const workloadByStatus = {
    todo: tasks.filter(task => task.status === TaskStatus.TODO)
      .reduce((total, task) => total + (task.estimatedHours || 0), 0),
    inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS)
      .reduce((total, task) => total + (task.estimatedHours || 0), 0),
    inReview: tasks.filter(task => task.status === TaskStatus.IN_REVIEW)
      .reduce((total, task) => total + (task.estimatedHours || 0), 0),
    overdue: overdueTasks
      .filter(task => task.status !== TaskStatus.DONE) // Only count hours for non-completed overdue tasks
      .reduce((total, task) => total + (task.estimatedHours || 0), 0),
  };

  return {
    totalEstimatedHours,
    workloadByStatus,
    statusCounts
  };
};
