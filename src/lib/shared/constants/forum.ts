import { ForumCategory } from '../types/database.types';

export const FORUM_CATEGORIES: { value: ForumCategory; label: string; description: string }[] = [
  {
    value: 'general',
    label: 'General Discussion',
    description: 'General topics and community discussions',
  },
  {
    value: 'clinical_cases',
    label: 'Clinical Cases',
    description: 'Discuss interesting clinical cases and outcomes',
  },
  {
    value: 'techniques',
    label: 'Techniques & Procedures',
    description: 'Share and learn about dental techniques',
  },
  {
    value: 'equipment',
    label: 'Equipment & Technology',
    description: 'Discuss dental equipment and technology',
  },
  {
    value: 'practice_management',
    label: 'Practice Management',
    description: 'Business and practice management topics',
  },
  {
    value: 'education',
    label: 'Education & Training',
    description: 'Continuing education and training resources',
  },
  {
    value: 'research',
    label: 'Research & Evidence',
    description: 'Latest research and evidence-based dentistry',
  },
  {
    value: 'off_topic',
    label: 'Off Topic',
    description: 'Non-dental related discussions',
  },
];

export const getCategoryLabel = (value: ForumCategory): string => {
  return FORUM_CATEGORIES.find((c) => c.value === value)?.label || value;
};

export const getCategoryColor = (value: ForumCategory): string => {
  const colors: Record<ForumCategory, string> = {
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    clinical_cases: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    techniques: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    equipment: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    practice_management: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    education: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    research: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    off_topic: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  };
  return colors[value] || colors.general;
};
