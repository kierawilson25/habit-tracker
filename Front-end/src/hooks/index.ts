// Authentication hooks
export { useSupabaseAuth } from './auth/useSupabaseAuth';

// UI hooks
export { useMounted } from './ui/useMounted';

// Form hooks
export { useForm } from './forms/useForm';
export type { UseFormOptions, UseFormReturn } from './forms/useForm';

// Data hooks
export { useHabits } from './data/useHabits';
export type { UseHabitsOptions, UseHabitsReturn } from './data/useHabits';
export { useStreakCalculation } from './data/useStreakCalculation';
export type { UseStreakCalculationReturn } from './data/useStreakCalculation';
export { useUserStats } from './data/useUserStats';
export type { UseUserStatsOptions, UseUserStatsReturn, UserStats } from './data/useUserStats';
