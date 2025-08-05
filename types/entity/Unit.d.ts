import * as Image from '../graphics/Image';
import { PixiSpriteOptions } from '../graphics/PixiUtils';
import { UnitSubType, UnitType, Faction } from '../types/commonTypes';
import type { Vec2 } from '../jmath/Vec';
import Underworld from '../Underworld';
import { HasLife, HasMana, HasSpace, HasStamina } from './Type';
import { Modifier } from '../cards/util';
import { IPickup } from './Pickup';
export interface UnitPath {
    points: Vec2[];
    lastOwnPosition: Vec2;
    targetPosition: Vec2;
}
export type IUnitSerialized = Omit<IUnit, "predictionCopy" | "resolveDoneMoving" | "image" | "animations" | "sfx" | "summonedBy"> & {
    image?: Image.IImageAnimatedSerialized;
    summonedById: number | undefined;
};
export interface UnitAnimations {
    idle: string;
    hit: string;
    attack: string;
    die: string;
    walk: string;
}
export interface UnitSFX {
    death: string;
    damage: string;
}
export declare function isUnit(maybeUnit: any): maybeUnit is IUnit;
export type IUnit = HasSpace & HasLife & HasMana & HasStamina & {
    type: 'unit';
    id: number;
    soulFragments: number;
    soulsBeingCollected?: boolean;
    unitSourceId: string;
    real?: IUnit;
    predictionCopy?: IUnit;
    summonedBy?: IUnit;
    strength: number;
    originalLife: boolean;
    path?: UnitPath;
    moveSpeed: number;
    resolveDoneMoving: (doReturnToDefaultSprite: boolean | PromiseLike<boolean>) => void;
    attackRange: number;
    name?: string;
    isMiniboss: boolean;
    isPrediction?: boolean;
    predictionScale?: number;
    faction: Faction;
    UITargetCircleOffsetY: number;
    defaultImagePath: string;
    shaderUniforms: {
        [key: string]: any;
    };
    damage: number;
    bloodColor: number;
    manaCostToCast: number;
    manaPerTurn: number;
    unitType: UnitType;
    unitSubType: UnitSubType;
    flaggedForRemoval?: boolean;
    events: string[];
    animations: UnitAnimations;
    sfx: UnitSFX;
    modifiers: {
        [key: string]: Modifier;
    };
    predictedNextTurnDamage: number;
    attentionMarker?: {
        imagePath: string;
        pos: Vec2;
        unitSpriteScaleY: number;
        markerScale: number;
        removalTimeout?: number;
    };
    takingPureDamage?: boolean;
    charges?: {
        [spellId: string]: number;
    };
    chargesMaxAdditional?: number;
    difficulty: number;
};
export declare function create(unitSourceId: string, x: number, y: number, faction: Faction, defaultImagePath: string, unitType: UnitType, unitSubType: UnitSubType, sourceUnitProps: Partial<IUnit> | undefined, underworld: Underworld, prediction?: boolean, creator?: IUnit): IUnit;
export declare function updateAccessibilityOutline(unit: IUnit, targeted: boolean, outOfRange?: boolean): void;
interface DifficultyAdjustedUnitStats {
    healthMax: number;
    health: number;
}
export declare function adjustUnitPropsDueToDifficulty(stats: DifficultyAdjustedUnitStats, difficultyRatio: number): DifficultyAdjustedUnitStats;
export declare function adjustUnitDifficulty(unit: IUnit, newDifficulty: number): void;
export declare function addModifier(unit: IUnit, key: string, underworld: Underworld, prediction: boolean, quantity?: number, extra?: object): void;
export declare function removeRune(unit: IUnit, key: string, underworld: Underworld): void;
export declare function removeModifier(unit: IUnit, key: string, underworld: Underworld): void;
export declare function cleanup(unit: IUnit, maintainPosition?: boolean, forceCleanPlayerUnit?: boolean): void;
export declare function serialize(unit: IUnit): IUnitSerialized;
export declare function load(unit: IUnitSerialized, underworld: Underworld, prediction: boolean): IUnit;
export declare function syncronize(unitSerialized: IUnitSerialized, originalUnit: IUnit): void;
export declare function changeToDieSprite(unit: IUnit): void;
export declare function returnToDefaultSprite(unit: IUnit): void;
export declare function playComboAnimation(unit: IUnit, key: string | undefined, keyMoment?: () => Promise<any>, options?: PixiSpriteOptions): Promise<void>;
export declare function playAnimation(unit: IUnit, spritePath: string | undefined, options?: PixiSpriteOptions): Promise<void>;
export declare function resurrect(unit: IUnit, underworld: Underworld, preventRepeatRez?: boolean): boolean;
export declare function die(unit: IUnit, underworld: Underworld, prediction: boolean, sourceUnit?: IUnit): void;
export declare function composeOnDealDamageEvents(damageArgs: damageArgs, underworld: Underworld, prediction: boolean): number;
export declare function composeOnTakeDamageEvents(damageArgs: damageArgs, underworld: Underworld, prediction: boolean): number;
interface damageArgs {
    unit: IUnit;
    amount: number;
    sourceUnit?: IUnit;
    fromVec2?: Vec2;
    thinBloodLine?: boolean;
    pureDamage?: boolean;
}
export declare function takeDamage(damageArgs: damageArgs, underworld: Underworld, prediction: boolean): void;
export declare function syncPlayerHealthManaUI(underworld: Underworld): void;
export declare function syncStaminaBar(): void;
export declare function isBoss(unitSourceId: string): boolean;
export declare function isRemaining(unit: IUnit, underworld: Underworld, prediction: boolean): boolean | Modifier | undefined;
export declare function canAct(unit: IUnit): boolean;
export declare function canMove(unit: IUnit): boolean;
export declare function deadUnits(unit: IUnit, units: IUnit[]): IUnit[];
export declare function livingUnitsInSameFaction(unit: IUnit, units: IUnit[]): IUnit[];
export declare function livingUnitsInDifferentFaction(unit: IUnit, units: IUnit[]): IUnit[];
export declare function findClosestUnitInSameFaction(unit: IUnit, units: IUnit[]): IUnit | undefined;
export declare function findClosestUnitInDifferentFactionSmartTarget(unit: IUnit, units: IUnit[]): IUnit | undefined;
export declare function closestInListOfUnits(source: Vec2, units: IUnit[]): IUnit | undefined;
export declare function filterSmartTarget(u: IUnit): boolean;
export declare function orient(unit: IUnit, faceTarget: Vec2): void;
export declare function _moveTowards(unit: IUnit, target: Vec2, underworld: Underworld): void;
export declare function moveTowardsMulti(unit: IUnit, points: Vec2[], underworld: Underworld): Promise<void>;
export declare function moveTowards(unit: IUnit, point: Vec2, underworld: Underworld): Promise<void>;
export declare function setLocation(unit: IUnit, coordinates: Vec2, underworld: Underworld, prediction: boolean): void;
export declare function changeFaction(unit: IUnit, faction: Faction): void;
export declare function syncImage(unit: IUnit): void;
export declare function getExplainPathForUnitId(id: string): string;
export declare function inRange(unit: IUnit, target: Vec2): boolean;
export declare function startTurnForUnits(units: IUnit[], underworld: Underworld, prediction: boolean): Promise<void>;
export declare function endTurnForUnits(units: IUnit[], underworld: Underworld, prediction: boolean): Promise<void>;
export declare function runTurnStartEvents(unit: IUnit, underworld: Underworld, prediction: boolean): Promise<void>;
export declare function runTurnEndEvents(unit: IUnit, underworld: Underworld, prediction: boolean): Promise<void>;
export declare function runPickupEvents(unit: IUnit, pickup: IPickup, underworld: Underworld, prediction: boolean): Promise<void>;
export declare function getSoulFragmentsForMiniboss(nonMinibossSoulFragments: number): number;
export declare function makeMiniboss(unit: IUnit, underworld: Underworld): void;
export declare function copyForPredictionUnit(u: IUnit, underworld: Underworld): IUnit;
export declare function setPlayerAttributeMax(unit: IUnit, attribute: 'manaMax' | 'healthMax' | 'staminaMax', newValue: number): void;
export declare function isUnitsTurnPhase(unit: IUnit, underworld: Underworld): boolean;
export declare function subTypeToAttentionMarkerImage(unit: IUnit): string;
export declare function findLOSLocation(unit: IUnit, target: Vec2, underworld: Underworld): Vec2[];
export declare function drawSelectedGraphics(unit: IUnit, prediction: boolean | undefined, underworld: Underworld): void;
export declare function demoAnimations(unit: IUnit): Promise<void>;
export declare function resetUnitStats(unit: IUnit, underworld: Underworld): void;
export declare function unitSourceIdToName(unitSourceId: string, asMiniboss: boolean): string;
export declare function getFactionsOf(units: {
    faction: Faction;
}[]): Faction[];
export declare function addEvent(unit: IUnit, eventId: string): void;
export declare function countCharges(unit: IUnit): number;
export declare function refillCharges(unit: IUnit, underworld: Underworld): void;
export declare function drawCharges(unit: IUnit, underworld: Underworld, count?: number): void;
export declare function getMaxCharges(unit: IUnit, underworld: Underworld): number;
export {};
