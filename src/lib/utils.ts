import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Calculate business (working) days between two dates,
 * excluding days not in the workingDays list.
 */
export function countBusinessDays(
  start: Date,
  end: Date,
  workingDays: string[]
): number {
  const workingSet = new Set(workingDays);
  let count = 0;
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (d <= endDate) {
    if (workingSet.has(DAY_NAMES[d.getDay()])) {
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/**
 * Calculate remaining working days from today to a due date.
 * Returns negative if overdue (in working days).
 */
export function remainingWorkDays(
  dueDate: Date,
  workingDays: string[]
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due >= today) {
    return countBusinessDays(today, due, workingDays);
  } else {
    return -countBusinessDays(due, today, workingDays);
  }
}

/**
 * Check if current time is within business hours.
 */
export function isWithinBusinessHours(
  businessHoursStart: string,
  businessHoursEnd: string
): boolean {
  const now = new Date();
  const [startH, startM] = businessHoursStart.split(":").map(Number);
  const [endH, endM] = businessHoursEnd.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Check if today is a working day.
 */
export function isWorkingDay(workingDays: string[]): boolean {
  const today = DAY_NAMES[new Date().getDay()];
  return workingDays.includes(today);
}
