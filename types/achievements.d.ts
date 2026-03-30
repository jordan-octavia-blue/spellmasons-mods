import type Underworld from './Underworld';
export declare const achievementEventsId = "Achievements";
export declare function isUnlocked(name: string): boolean;
export declare function unlock(achievementName: string): void;
export declare function registerAchievementEvents(): void;
export type LifecycleTrigger = 'levelComplete' | 'gameOver' | 'gameWon';
export declare function checkLifecycleAchievements(underworld: Underworld, trigger: LifecycleTrigger): void;
