import type { Quest } from './quests.data';

export type QuestCategory = Quest['category'];

export const QUEST_CATEGORIES: QuestCategory[] = ['main', 'side', 'daily', 'access'];

const QUEST_CATEGORY_CLASSES: Record<QuestCategory, string> = {
  main: 'category-main',
  side: 'category-side',
  daily: 'category-daily',
  access: 'category-access',
};

export function questCategoryClass(category: QuestCategory): string {
  return QUEST_CATEGORY_CLASSES[category];
}
