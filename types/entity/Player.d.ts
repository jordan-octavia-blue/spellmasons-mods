import * as Unit from './Unit';
import * as Cards from '../cards';
import { Faction, WizardType } from '../types/commonTypes';
import Underworld from '../Underworld';
export type IPlayerSerialized = Omit<IPlayer, "unit"> & {
    unit: {
        id: number;
    };
};
export interface CardUsage {
    [cardId: string]: number;
}
interface Stats {
    bestSpell: {
        unitsKilled: number;
        spell: string[];
    };
    longestSpell: string[];
    gameStartTime: number;
    totalKills: number;
}
export interface IPlayer {
    name: string;
    color: number;
    wizardType: WizardType;
    companion?: string;
    lockedDiscardCards: string[];
    colorMagic: number;
    endedTurn: boolean;
    clientId: string;
    playerId: string;
    clientConnected: boolean;
    unit: Unit.IUnit;
    awaitingSpawn: boolean;
    isSpawned: boolean;
    cardsInToolbar: string[];
    inventory: string[];
    disabledCards: string[];
    freeSpells: string[];
    upgrades: string[];
    upgradesLeftToChoose: number;
    cardUsageCounts: CardUsage;
    lobbyReady: boolean;
    reroll: number;
    drawChargesSeed: number | undefined;
    spellState: {
        [spellId: string]: any;
    };
    stats: Stats;
    cursesChosen: number;
    statPointsUnspent: number;
    extraStatPointsPerRound: number;
    lockedRunes: {
        index: number;
        key: string;
        runePresentedIndexWhenLocked?: number;
    }[];
    runePresentedIndex: number;
    gameVersion?: string;
    skippedCards: number;
}
export declare function inPortal(player: IPlayer): boolean;
export declare function create(clientId: string, playerId: string, underworld: Underworld): IPlayer;
export declare function setPlayerRobeColor(player: IPlayer, color: number | string, colorMagic?: number | string): void;
export declare function initializeWizardStatsForLevelStart(player: IPlayer, underworld: Underworld): void;
export declare function resetPlayerForNextLevel(player: IPlayer, underworld: Underworld): void;
export declare function updateGlobalRefToPlayerIfCurrentClient(player: IPlayer): void;
export declare function serialize(player: IPlayer): IPlayerSerialized;
export declare function load(player: IPlayerSerialized, index: number, underworld: Underworld, isClientPlayerSourceOfTruth: boolean): IPlayer | undefined;
export declare function restoreWizardTypeVisuals(player: IPlayer, underworld: Underworld): void;
export declare function setClientConnected(player: IPlayer, connected: boolean, underworld: Underworld): void;
export declare function syncLobby(underworld: Underworld): void;
export declare function enterPortal(player: IPlayer, underworld: Underworld): void;
export declare function resetPlayerForSpawn(player: IPlayer, underworld: Underworld): void;
export declare function ableToAct(player: IPlayer): boolean;
export declare function addCardToHand(card: Cards.ICard | undefined, player: IPlayer | undefined, underworld: Underworld): void;
export declare function setSpellmasonsToChannellingAnimationClose(player: IPlayer): Promise<void>;
export declare function setSpellmasonsToChannellingAnimation(player: IPlayer): void;
export declare function removeCardsFromHand(player: IPlayer, cards: string[], underworld: Underworld): void;
export declare function getFactionsOf(players: {
    clientConnected: boolean;
    unit: {
        faction: Faction;
    };
}[]): Faction[];
export declare function incrementPresentedRunesForPlayer(player: Pick<IPlayer, 'lockedRunes' | 'runePresentedIndex'>, underworld: Underworld): void;
export declare function setWizardType(player: IPlayer, wizardType: WizardType | undefined | null, underworld?: Underworld): void;
export declare function syncLockedCardsAndCSS(player?: IPlayer): void;
export declare function toggleCardLockedForDiscard(player: IPlayer | undefined, cardId: string, underworld: Underworld): void;
export declare function discardCards(player: IPlayer, underworld: Underworld, { forceDiscardAll, dryRun }: {
    forceDiscardAll?: boolean;
    dryRun?: boolean;
}): number;
export declare function isDeathmason(player?: IPlayer): boolean;
export declare function isGoru(player: IPlayer): boolean;
export {};
