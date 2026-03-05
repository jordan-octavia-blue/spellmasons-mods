export interface IGameRules {
    PLAYER_BASE_HEALTH: number;
    UNIT_MOVE_SPEED: number;
    UNIT_BASE_DAMAGE: number;
    UNIT_BASE_RANGE: number;
    UNIT_BASE_STAMINA: number;
    UNIT_BASE_HEALTH: number;
    UNIT_BASE_MANA: number;
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
export declare function getStoredCustomRules(): IGameRules;
