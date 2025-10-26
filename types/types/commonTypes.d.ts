import type * as particles from 'jdoleary-fork-pixi-particle-emitter';
import { Events, Modifiers, Spell } from '../cards';
import { IPickupSource } from '../entity/Pickup';
import { UnitSource } from '../entity/units';
import type PieClient from '@websocketpie/client';
import type PiePeer from '../network/PiePeer';
import type { IHostApp } from '../network/networkUtil';
import { HandmadeMap } from '../MapsHandmade';
export type GameMode = 'tutorial' | 'hard' | 'impossible';
export type WizardType = 'Spellmason' | 'Deathmason' | 'Goru';
export declare enum UnitType {
    PLAYER_CONTROLLED = 0,
    AI = 1
}
export declare enum UnitSubType {
    MELEE = 0,
    RANGED_LOS = 1,
    RANGED_RADIUS = 2,
    SUPPORT_CLASS = 3,
    SPECIAL_LOS = 4,
    DOODAD = 5,
    GORU_BOSS = 6
}
export declare enum Faction {
    ALLY = 0,
    ENEMY = 1
}
export declare enum CardCategory {
    Damage = 0,
    Movement = 1,
    Targeting = 2,
    Mana = 3,
    Curses = 4,
    Blessings = 5,
    Soul = 6
}
export declare enum CardRarity {
    COMMON = "COMMON",
    SPECIAL = "SPECIAL",
    UNCOMMON = "UNCOMMON",
    RARE = "RARE",
    FORBIDDEN = "FORBIDDEN",
    RUNIC = "RUNIC"
}
export declare const probabilityMap: Record<CardRarity, number>;
export type JEmitter = particles.Emitter & {
    cleanAfterTurn?: boolean;
};
export interface Mod {
    modName: string;
    author: string;
    description: string;
    screenshot: string;
    sfx?: {
        [key: string]: string[];
    };
    spritesheet?: string;
    units?: UnitSource[];
    pickups?: IPickupSource[];
    spells?: Spell[];
    modifiers?: Modifiers[];
    events?: Events[];
    maps?: HandmadeMap[];
    familiars?: string[];
}
export type Pie = PieClient | PiePeer | IHostApp;
export interface RequestToJoin {
    sender: string;
    senderClientId: string;
    signal: string;
}
