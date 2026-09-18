import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn-style `cn` utility: merges Tailwind classes with clsx + tailwind-merge.
 * Usage: `className={cn('px-2', condition && 'py-1')}`
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
