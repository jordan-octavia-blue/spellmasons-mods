import Underworld from "./Underworld";
export declare function calculateGameDifficulty(underworld: Underworld): number;
export declare function getPlayerSimulatedLevelBonus(underworld: Underworld): number;
export declare function unavailableUntilLevelIndexDifficultyModifier(underworld: Underworld): {
    budgetMultiplier: number;
    unitMinLevelIndexSubtractor: number;
};
