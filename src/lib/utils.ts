import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from a name, excluding title prefixes (Dr., Mr., Ms., Mrs.)
 * @param name - Full name string
 * @returns 2-character initials
 */
export function getInitials(name: string): string {
  if (!name) return '?';

  // Filter out title prefixes
  const titles = ['Dr.', 'Mr.', 'Ms.', 'Mrs.'];
  const parts = name.split(' ').filter(part => !titles.includes(part));

  return parts
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

