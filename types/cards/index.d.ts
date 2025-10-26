import type * as Player from '../entity/Player';
import * as Unit from '../entity/Unit';
import * as Pickup from '../entity/Pickup';
import type { Vec2 } from '../jmath/Vec';
import { onDealDamage, onTakeDamage, onLiquid, onKill, onTooltip, onDeath, onMove, onAgro, onTurnStart, onTurnEnd, onDrawSelected, onProjectileCollision, onTeleport, onSpawn, onPickup, onFullTurnCycle, onCostCalculation, onForceMove } from '../Events';
import { Subsprite } from '../Subsprites';
import { CardCost } from './cardUtils';
import Underworld from '../Underworld';
import { CardCategory, WizardType } from '../types/commonTypes';
import { HasSpace } from '../entity/Type';
import { Overworld } from '../Overworld';
import { Localizable } from '../localization';
export interface Modifiers {
    id?: string;
    subsprite?: Subsprite;
    constant?: boolean;
    stage?: MODIFIER_STAGE;
    addModifierVisuals?: (unit: Unit.IUnit, underworld: Underworld) => void;
    add?: (unit: Unit.IUnit, underworld: Underworld, prediction: boolean, quantity: number, extra?: object) => void;
    remove?: (unit: Unit.IUnit, underworld: Underworld) => void;
    unitOfMeasure?: string;
    description?: Localizable;
    probability?: number;
    unavailableUntilLevelIndex?: number;
    _costPerUpgrade?: number;
    quantityPerUpgrade?: number;
    maxUpgradeCount?: number;
    keepBetweenLevels?: boolean;
    omitForWizardType?: WizardType[];
    isMalady?: boolean;
}
export declare function calcluateModifierCostPerUpgrade(mod: Modifiers, underworld: Underworld, player?: Player.IPlayer): number;
export interface Events {
    id?: string;
    onDealDamage?: onDealDamage;
    onTakeDamage?: onTakeDamage;
    onLiquid?: onLiquid;
    onKill?: onKill;
    onTooltip?: onTooltip;
    onDeath?: onDeath;
    onMove?: onMove;
    onTeleport?: onTeleport;
    onSpawn?: onSpawn;
    onPickup?: onPickup;
    onAgro?: onAgro;
    onFullTurnCycle?: onFullTurnCycle;
    onTurnStart?: onTurnStart;
    onTurnEnd?: onTurnEnd;
    onDrawSelected?: onDrawSelected;
    onProjectileCollision?: onProjectileCollision;
    onCostCalculation?: onCostCalculation;
    onForceMove?: onForceMove;
}
export interface Spell {
    card: ICard;
    modifiers?: Modifiers;
    events?: Events;
}
export declare function registerModifiers(id: string, modifiers: Modifiers): void;
export declare function registerEvents(id: string, events: Events): void;
export declare function registerSpell(spell: Spell, overworld: Overworld): void;
export declare function registerCards(overworld: Overworld): void;
export declare function refreshSummonCardDescriptions(underworld: Underworld): void;
export interface EffectState {
    cardIds: string[];
    shouldRefundLastSpell: boolean;
    casterCardUsage?: Player.CardUsage;
    casterUnit: Unit.IUnit;
    casterPositionAtTimeOfCast: Vec2;
    casterPlayer?: Player.IPlayer;
    targetedUnits: Unit.IUnit[];
    targetedPickups: Pickup.IPickup[];
    castLocation: Vec2;
    aggregator: {
        radiusBoost: number;
        additionalPierce: number;
        additionalBounce: number;
    };
    initialTargetedUnitId: number | undefined;
    initialTargetedPickupId: number | undefined;
    spellCostTally: CardCost | undefined;
}
export declare function refundLastSpell(state: EffectState, prediction: boolean, floatingMessage?: string): void;
export declare function hasTargetAtPosition(position: Vec2, underworld: Underworld): boolean;
export declare function defaultTargetsForAllowNonUnitTargetTargetingSpell(targets: Vec2[], castLocation: Vec2, card: ICard): Vec2[];
export declare function getCurrentTargets(state: EffectState): HasSpace[];
export type EffectFn = {
    (state: EffectState, card: ICard, quantity: number, underworld: Underworld, prediction: boolean, outOfRange?: boolean): Promise<EffectState>;
};
export interface ICard {
    id: string;
    replaces?: string[];
    requires?: string[];
    modName?: string;
    category: CardCategory;
    manaCost: number;
    healthCost: number;
    staminaCost?: number;
    costGrowthAlgorithm?: "nlogn" | "log" | 'exponential';
    probability: number;
    thumbnail: string;
    animationPath?: string;
    effect: EffectFn;
    description: Localizable;
    requiresFollowingCard?: boolean;
    expenseScaling: number;
    allowNonUnitTarget?: boolean;
    noInitialTarget?: boolean;
    supportQuantity?: boolean;
    onlySelectDeadUnits?: boolean;
    ignoreRange?: boolean;
    sfx?: string;
    frontload?: boolean;
    omitForWizardType?: WizardType[];
    soulFragmentCostOverride?: number;
}
export declare const allCards: {
    [cardId: string]: ICard;
};
export declare const allModifiers: {
    [id: string]: Modifiers;
};
export declare function getCardsFromIds(cardIds: string[]): ICard[];
export declare function addTarget(target: any, effectState: EffectState, underworld: Underworld, prediction: boolean): void;
export declare function addUnitTarget(unit: Unit.IUnit, effectState: EffectState, prediction: boolean): void;
export declare function addPickupTarget(pickup: Pickup.IPickup, effectState: EffectState): void;
export declare function getMaxRuneQuantity(modifier: Modifiers): number;
export type MODIFIER_STAGE = 'Soul Shard' | 'Soul Bind' | 'Amount Multiplier' | 'Amount Flat' | 'Amount Override' | 'Blood Curse' | 'Reactive Effects' | 'Unstaged Events';
export declare const MODIFIER_ORDER: MODIFIER_STAGE[];
export declare function eventsSorter(lookup: typeof allModifiers): (eventA: string, eventB: string) => number;
