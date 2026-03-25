import { GameMode } from './commonTypes';
export interface IGameRules {
    PLAYER_BASE_HEALTH: number;
    UNIT_HEALTH_MULTIPLIER: number;
    UNIT_MANA_MULTIPLIER: number;
    UNIT_DAMAGE_MULTIPLIER: number;
    UNIT_RANGE_MULTIPLIER: number;
    UNIT_STAMINA_MULTIPLIER: number;
    UNIT_MOVE_SPEED_MULTIPLIER: number;
    PLAYER_BASE_ATTACK_RANGE: number;
    PLAYER_BASE_STAMINA: number;
    STARTING_CARD_COUNT: number;
    STAT_POINTS_PER_LEVEL: number;
    RUNES_PER_LEVEL: number;
    DEATHMASON_DISCARD_DRAW_RATIO: number;
    GORU_PLAYER_STARTING_SOUL_FRAGMENTS: number;
    GORU_SOUL_COLLECT_RADIUS: number;
    SOUL_FRAGMENTS_MAX_STARTING: number;
}
export declare function getDefaultGameRules(): IGameRules;
export declare function getRules(gameMode?: GameMode): IGameRules;
