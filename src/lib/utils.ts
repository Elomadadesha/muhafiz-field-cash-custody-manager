import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getTimeBasedGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `صباح الخير، ${name}`;
  if (hour >= 12 && hour < 17) return `طاب يومك، ${name}`;
  return `مساء الخير، ${name}`;
}