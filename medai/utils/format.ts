import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function formatDate(date: string, pattern = 'MMM d, yyyy') {
  try {
    return format(parseISO(date), pattern);
  } catch {
    return date;
  }
}

export function formatRelative(date: string) {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return date;
  }
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function groupByDateLabel<T extends { timestamp: string }>(items: T[]) {
  const groups: Record<string, T[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  items.forEach((item) => {
    try {
      const d = parseISO(item.timestamp);
      if (isToday(d)) groups.Today.push(item);
      else if (isYesterday(d)) groups.Yesterday.push(item);
      else groups.Earlier.push(item);
    } catch {
      groups.Earlier.push(item);
    }
  });

  return Object.entries(groups).filter(([, list]) => list.length > 0);
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
