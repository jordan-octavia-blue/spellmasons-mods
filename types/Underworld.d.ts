/// <reference types="node" />
import * as Unit from './entity/Unit';
import * as Pickup from './entity/Pickup';
import * as Obstacle from './entity/Obstacle';
import * as Player from './entity/Player';
import * as Upgrade from './Upgrade';
import * as Cards from './cards';
import * as Image from './graphics/Image';
import { BloodParticle } from './graphics/PixiUtils';
import { Faction, UnitSubType, GameMode, Pie } from './types/commonTypes';
import type { Vec2 } from "./jmath/Vec";
import { prng, SeedrandomState } from './jmath/rand';
import { LineSegment } from './jmath/lineSegment';
import { Polygon2, Polygon2LineSegment } from './jmath/Polygon2';
import { ForceMove } from './jmath/moveWithCollision';
import { Limits as Limits, Tile } from './MapOrganicCave';
import { DisplayObject, TilingSprite } from 'pixi.js';
import { HasSpace } from './entity/Type';
import { Overworld } from './Overworld';
import { Emitter } from 'jdoleary-fork-pixi-particle-emitter';
export declare enum turn_phase {
    Stalled = 0,
    PlayerTurns = 1,
    NPC_ALLY = 2,
    NPC_ENEMY = 3
}
export declare const elUpgradePickerContent: HTMLElement | undefined;
export declare const showUpgradesClassName = "showUpgrades";
export default class Underworld {
    seed: string;
    gameMode?: GameMode;
    difficulty: number;
    localUnderworldNumber: number;
    overworld: Overworld;
    random: prng;
    pie: Pie;
    levelIndex: number;
    isTutorialRun: boolean;
    wave: number;
    RNGState?: SeedrandomState;
    turn_phase: turn_phase;
    subTypesTurnOrder: UnitSubType[][];
    subTypesCurrentTurn?: UnitSubType[];
    lastUnitId: number;
    lastPickupId: number;
    turn_number: number;
    hasSpawnedBoss: boolean;
    limits: Limits;
    players: Player.IPlayer[];
    units: Unit.IUnit[];
    unitsPrediction: Unit.IUnit[];
    pickups: Pickup.IPickup[];
    pickupsPrediction: Pickup.IPickup[];
    imageOnlyTiles: Tile[];
    liquidSprites: TilingSprite[];
    walls: LineSegment[];
    liquidBounds: LineSegment[];
    liquidPolygons: Polygon2[];
    pathingPolygons: Polygon2[];
    pathingLineSegments: Polygon2LineSegment[];
    processedMessageCount: number;
    cardDropsDropped: number;
    enemiesKilled: number;
    events: string[];
    forceMove: ForceMove[];
    forceMovePrediction: ForceMove[];
    forceMovePromise: Promise<void> | undefined;
    timeSinceLastSimulationStep: number;
    lastThoughtsHash: string;
    playerThoughts: {
        [clientId: string]: {
            target: Vec2;
            currentDrawLocation?: Vec2;
            lerp: number;
            cardIds: string[];
            ellipsis: boolean;
        };
    };
    lastLevelCreated: LevelData | undefined;
    allowForceInitGameState: boolean;
    removeEventListeners: undefined | (() => void);
    bloods: BloodParticle[];
    isRestarting: NodeJS.Timer | undefined;
    particleFollowers: {
        displayObject: DisplayObject;
        emitter?: Emitter;
        target: Vec2;
        keepOnDeath?: boolean;
    }[];
    companions: {
        image: Image.IImageAnimated;
        target: Vec2;
    }[];
    activeMods: string[];
    generatingLevel: boolean;
    simulatingMovePredictions: boolean;
    allyNPCAttemptWinKillSwitch: number;
    aquirePickupQueue: {
        pickupId: number;
        unitId: number;
        timeout: number;
        flaggedForRemoval: boolean;
    }[];
    startTime: number | undefined;
    winTime: number | undefined;
    headlessTimeouts: {
        time: number;
        callback: () => void;
    }[];
    _battleLog: string[];
    serverStabilityMaxUnits: number | undefined;
    serverStabilityMaxPickups: number | undefined;
    constructor(overworld: Overworld, pie: Pie, seed: string, RNGState?: SeedrandomState | boolean);
    addEvent(eventId: string): void;
    getAllUnits(prediction: boolean): Unit.IUnit[];
    getPotentialTargets(prediction: boolean): HasSpace[];
    calculateKillsNeededForLevel(level: number): number;
    getNumberOfEnemyKillsNeededForNextLevelUp(): number;
    reportEnemyKilled(unit: Unit.IUnit): void;
    syncPlayerPredictionUnitOnly(): void;
    syncPredictionEntities(): void;
    syncronizeRNG(RNGState: SeedrandomState | boolean): prng;
    fullySimulateForceMovePredictions(): void;
    runForceMove(forceMoveInst: ForceMove, deltaTime: number, prediction: boolean): boolean;
    queueGameLoop: () => void;
    addForceMove(forceMoveInst: ForceMove, prediction: boolean): void;
    resetForceMoveTimeout(): void;
    gameLoopForceMove: (deltaTime: number) => boolean;
    gameLoopUnit: (u: Unit.IUnit, aliveNPCs: Unit.IUnit[], deltaTime: number) => boolean;
    awaitForceMoves: (prediction?: boolean) => Promise<void>;
    triggerGameLoopHeadless: () => void;
    _gameLoopHeadless: (loopCount: number) => boolean;
    gameLoop: (timestamp: number) => void;
    setPath(unit: Unit.IUnit, target: Vec2): void;
    calculatePath(preExistingPath: Unit.UnitPath | undefined, startPoint: Vec2, target: Vec2): Unit.UnitPath;
    calculatePathNoCache(startPoint: Vec2, target: Vec2): Unit.UnitPath;
    drawResMarkers(): void;
    drawEnemyAttentionMarkers(): void;
    drawPlayerThoughts(): void;
    isMyTurn(): boolean;
    cleanup(): void;
    cacheWalls(obstacles: Obstacle.IObstacle[], emptyTiles: Tile[]): void;
    spawnPickup(index: number, coords: Vec2, prediction?: boolean): Pickup.IPickup | undefined;
    spawnEnemy(id: string, coords: Vec2, isMiniboss: boolean): Unit.IUnit | undefined;
    testLevelData(): LevelData;
    isInsideLiquid(point: Vec2): boolean;
    assertDemoExit(): void;
    generateRandomLevelData(levelIndex: number): LevelData | undefined;
    pickGroundTileLayers(biome: Biome): string[];
    addGroundTileImages(biome: Biome): void;
    isPointValidSpawn(spawnPoint: Vec2, prediction: boolean, extra?: {
        intersectionRadius?: number;
        allowLiquid?: boolean;
        unobstructedPoint?: Vec2;
    }): boolean;
    findValidSpawnInWorldBounds(prediction: boolean, seed: prng, extra?: {
        allowLiquid?: boolean;
        unobstructedPoint?: Vec2;
    }): Vec2 | undefined;
    DEPRECIATED_findValidSpawnInRadius(center: Vec2, prediction: boolean, extra?: {
        allowLiquid?: boolean;
        unobstructedPoint?: Vec2;
        radiusOverride?: number;
    }): Vec2 | undefined;
    findValidSpawns({ spawnSource, ringLimit, radius, prediction }: {
        spawnSource: Vec2;
        ringLimit: number;
        radius?: number;
        prediction: boolean;
    }, extra?: {
        allowLiquid?: boolean;
        unobstructedPoint?: Vec2;
        radiusOverride?: number;
    }): Vec2[];
    cleanUpLevel(): void;
    postSetupLevel(): void;
    createLevelSyncronous(levelData: LevelData): void;
    _getLevelText(levelIndex: number): string;
    getLevelText(): string;
    giveStartOfLevelStatPoints({ levelIndex }: LevelData): void;
    createLevel(levelData: LevelData, gameMode?: GameMode): Promise<void>;
    generateLevelDataSyncronous(levelIndex: number, gameMode?: GameMode): LevelData;
    generateLevelData(levelIndex: number): Promise<void>;
    checkPickupCollisions(unit: Unit.IUnit, prediction: boolean): void;
    isCoordOnVoidTile(coord: Vec2): boolean;
    isCoordOnWallTile(coord: Vec2): boolean;
    getMousePos(): Vec2;
    getRemainingPlayerUnits(): Unit.IUnit[];
    getRemainingPlayerAllies(): Unit.IUnit[];
    getRemainingPlayerEnemies(): Unit.IUnit[];
    progressGameState(): Promise<false | undefined>;
    trySpawnBoss(): Promise<boolean>;
    trySpawnNextWave(): boolean;
    isLevelComplete(): boolean;
    trySpawnPortals(): boolean;
    tryGoToNextLevel(): boolean;
    isGameOver(): boolean;
    clearGameOverModal(): void;
    doGameOver(): void;
    restart(): void;
    updateGameOverModal(): void;
    hasCompletedTurn(player: Player.IPlayer): boolean;
    handleNextHotseatPlayer(): Promise<void>;
    changeToFirstHotseatPlayer(): Promise<void>;
    changeToHotseatPlayer(player: Player.IPlayer): Promise<void>;
    tryEndPlayerTurnPhase(): Promise<Boolean>;
    endPlayerTurnCleanup(): void;
    addMissingCompanions(player: Player.IPlayer): void;
    executePlayerTurn(): Promise<void>;
    quicksave(extraInfo?: string): void;
    executeNPCTurn(faction: Faction): Promise<void>;
    endFullTurnCycle(): Promise<void>;
    endMyTurnButtonHandler(): Promise<void>;
    endPlayerTurn(player: Player.IPlayer): Promise<void>;
    syncTurnMessage(): void;
    initializeTurnPhase(p: turn_phase): Promise<void>;
    setTurnPhase(p: turn_phase): void;
    broadcastTurnPhase(p: turn_phase): Promise<void>;
    tryRestartTurnPhaseLoop(): void;
    forceUpgrade(player: Player.IPlayer, upgrade: Upgrade.IUpgrade, free: boolean): void;
    chooseUpgrade(player: Player.IPlayer, upgrade: Upgrade.IUpgrade): void;
    upgradesLeftToChoose(player: Player.IPlayer): number;
    upgradeRune(runeModifierId: string, player: Player.IPlayer, payload: {
        newSP: number;
    }): void;
    showUpgrades(): void;
    addRerollButton(player: Player.IPlayer): void;
    getRandomCoordsWithinBounds(bounds: Limits, seed?: prng): Vec2;
    redPortalBehavior(faction: Faction): void;
    incrementTargetsNextTurnDamage(targets: Unit.IUnit[], damage: number, canAttack: boolean, sourceUnit: Unit.IUnit): void;
    getSmartTargets(units: Unit.IUnit[], restartChunks?: boolean, skipChunking?: boolean): {
        [id: number]: {
            targets: Unit.IUnit[];
            canAttack: boolean;
        };
    };
    canUnitAttackTarget(u: Unit.IUnit, attackTarget?: Unit.IUnit): boolean;
    getEntitiesWithinDistanceOfTarget(target: Vec2, distance: number, prediction: boolean): HasSpace[];
    getPickupsWithinDistanceOfTarget(target: Vec2, distance: number, prediction: boolean): Pickup.IPickup[];
    getUnitsWithinDistanceOfTarget(target: Vec2, distance: number, prediction: boolean): Unit.IUnit[];
    getUnitsAt(coords: Vec2, prediction?: boolean): Unit.IUnit[];
    getUnitAt(coords: Vec2, prediction?: boolean): Unit.IUnit | undefined;
    getPickupAt(coords: Vec2, prediction?: boolean): Pickup.IPickup | undefined;
    getUnitById(id: number, prediction: boolean): Unit.IUnit | undefined;
    addUnitToArray(unit: Unit.IUnit, prediction: boolean): Unit.IUnit;
    addPickupToArray(pickup: Pickup.IPickup, prediction: boolean): void;
    castCards(args: CastCardsArgs): Promise<Cards.EffectState>;
    hasLineOfSight(seer: Vec2, target: Vec2): boolean;
    dev_shuffleUnits(): Unit.IUnit[];
    findIdenticalUnit(current: Unit.IUnit, potentialMatches: Unit.IUnitSerialized[]): Unit.IUnitSerialized | undefined;
    unitIsIdentical(unit: Unit.IUnit, serialized: Unit.IUnitSerialized): boolean;
    syncUnits(units: Unit.IUnitSerialized[], isClientSourceOfTruthForOwnUnit?: boolean): void;
    sendPlayerThinking(thoughts: {
        target?: Vec2;
        cardIds: string[];
    }): void;
    syncPlayers(syncFromPlayers: Player.IPlayerSerialized[], isClientPlayerSourceOfTruth: boolean): void;
    pickupIsIdentical(pickup: Pickup.IPickup, serialized: Pickup.IPickupSerialized): boolean;
    syncPickups(pickups: Pickup.IPickupSerialized[]): void;
    serializeForHash(): any;
    serializeForSaving(): IUnderworldSerialized;
    updateAccessibilityOutlines(): void;
    setContainerUnitsFilter(): void;
    getShuffledRunesForPlayer(player?: Player.IPlayer): ({
        key: string;
    } & Cards.Modifiers)[];
    battleLog(happening: string, englishOnly?: boolean): void;
}
type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type UnderworldNonFunctionProperties = Exclude<NonFunctionPropertyNames<Underworld>, null | undefined>;
export type IUnderworldSerialized = Omit<Pick<Underworld, UnderworldNonFunctionProperties>, "pie" | "overworld" | "prototype" | "players" | "units" | "unitsPrediction" | "pickups" | "pickupsPrediction" | "random" | "turnInterval" | "liquidSprites" | "particleFollowers" | "companions" | "walls" | "pathingPolygons" | "triggerGameLoopHeadless" | "_gameLoopHeadless" | "awaitForceMoves" | "queueGameLoop" | "gameLoop" | "gameLoopForceMove" | "gameLoopUnit" | "removeEventListeners"> & {
    players: Player.IPlayerSerialized[];
    units: Unit.IUnitSerialized[];
    pickups: Pickup.IPickupSerialized[];
};
export type Biome = 'water' | 'lava' | 'blood' | 'ghost';
export declare function biomeTextColor(biome?: Biome): number | string;
export interface LevelData {
    levelIndex: number;
    biome: Biome;
    limits: Limits;
    obstacles: Obstacle.IObstacle[];
    liquid: Tile[];
    imageOnlyTiles: Tile[];
    width: number;
    pickups: {
        index: number;
        coord: Vec2;
    }[];
    enemies: {
        id: string;
        coord: Vec2;
        isMiniboss: boolean;
    }[];
}
interface CastCardsArgs {
    casterCardUsage: Player.CardUsage;
    casterUnit: Unit.IUnit;
    casterPositionAtTimeOfCast: Vec2;
    cardIds: string[];
    castLocation: Vec2;
    prediction: boolean;
    outOfRange?: boolean;
    castForFree?: boolean;
    magicColor?: number;
    casterPlayer?: Player.IPlayer;
    initialTargetedUnitId?: number;
    initialTargetedPickupId?: number;
}
export {};
