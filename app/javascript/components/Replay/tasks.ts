export const allowedTasks = [
  'distance',
  'speed',
  'time',
  'vertical_speed',
  'distance_in_time',
  'distance_in_altitude',
  'flare'
] as const

export type Task = typeof allowedTasks[number]

export const isAllowedTask = (task: string | null): task is Task => {
  if (!task) return false
  return allowedTasks.includes(task as Task)
}
