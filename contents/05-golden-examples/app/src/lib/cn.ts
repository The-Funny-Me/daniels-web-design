import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Class merging helper (shadcn standard). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
