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

/**
 * Get the current site URL, handling Vercel environment variables and local development.
 * @returns The base URL of the application.
 */
export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (typeof window !== 'undefined' && window.location.origin) ||
    'http://localhost:3000/';

  // Make sure to include `https://` when not localhost
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}

