/**
 * Combine multiple class names together conditionally.
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}

/**
 * Format date into relative categories like "Today", "Yesterday", "Previous Days".
 */
export function groupConversationsByDate<T extends { updatedAt: string }>(conversations: T[]) {
  const groups: { [key: string]: T[] } = {
    Today: [],
    Yesterday: [],
    'Previous Days': [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const convo of conversations) {
    const convoDate = new Date(convo.updatedAt);
    convoDate.setHours(0, 0, 0, 0);

    if (convoDate.getTime() === today.getTime()) {
      groups.Today.push(convo);
    } else if (convoDate.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(convo);
    } else {
      groups['Previous Days'].push(convo);
    }
  }

  return groups;
}

/**
 * Generate a random UUID-like string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
