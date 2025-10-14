import type { Vec2 } from './jmath/Vec';
import type { IUnit } from './entity/Unit';
import type { HasSpace } from './entity/Type';
import Underworld from './Underworld';
import { IPickup } from './entity/Pickup';
import { ForceMoveProjectile } from './jmath/moveWithCollision';
import { CardCost } from './cards/cardUtils';
import type { IPlayer } from './entity/Player';
import { ICard } from './cards';
import { Faction } from './types/commonTypes';
export type onDealDamage = {
    (damageDealer: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageReciever?: IUnit): number;
};
export type onTooltip = {
    (unit: IUnit, underworld: Underworld): void;
};
export type onCostCalculation = {
    (caster: IPlayer, card: ICard, timesUsedSoFar: number, cardCost: CardCost): CardCost;
};
export type onForceMove = {
    (pushedObject: HasSpace, velocity: Vec2, sourceUnit?: IUnit): Vec2;
};
export type onTakeDamage = {
    (unit: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit): number;
};
export type onLiquid = {
    (unit: IUnit, currentlyInLiquid: boolean, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit): number;
};
export type onKill = {
    (killer: IUnit, killedUnit: IUnit, underworld: Underworld, prediction: boolean): Promise<void>;
};
export type onDeath = {
    (unit: IUnit, underworld: Underworld, prediction: boolean, sourceUnit?: IUnit): Promise<void>;
};
export type onMove = {
    (unit: IUnit, newLocation: Vec2): Vec2;
};
export type onSpawn = {
    (unit: IUnit, underworld: Underworld, prediction: boolean): void;
};
export type onTeleport = {
    (unit: IUnit, newLocation: Vec2, underworld: Underworld, prediction: boolean): void;
};
export type onPickup = {
    (unit: IUnit, pickup: IPickup, underworld: Underworld, prediction: boolean): Promise<void>;
};
export type onAgro = {
    (agroer: IUnit, agroTarget: IUnit): IUnit;
};
export type onFullTurnCycle = {
    (unit: IUnit, underworld: Underworld, prediction: boolean): Promise<void>;
};
export type onTurnStart = {
    (unit: IUnit, underworld: Underworld, prediction: boolean, faction: Faction): Promise<void>;
};
export type onTurnEnd = {
    (unit: IUnit, underworld: Underworld, prediction: boolean, faction: Faction): Promise<void>;
};
export type onDrawSelected = {
    (unit: IUnit, underworld: Underworld, prediction: boolean): Promise<void>;
};
export type onProjectileCollision = ({ unit, pickup, projectile, underworld, prediction }: {
    unit?: IUnit;
    pickup?: IPickup;
    projectile: ForceMoveProjectile;
    underworld: Underworld;
    prediction: boolean;
}) => void;
declare const _default: {
    onAgroSource: {
        [name: string]: onAgro;
    };
    onDealDamageSource: {
        [name: string]: onDealDamage;
    };
    onTakeDamageSource: {
        [name: string]: onTakeDamage;
    };
    onLiquidSource: {
        [name: string]: onLiquid;
    };
    onKillSource: {
        [name: string]: onKill;
    };
    onTooltipSource: {
        [name: string]: onTooltip;
    };
    onCostCalculationSource: {
        [name: string]: onCostCalculation;
    };
    onForceMoveSource: {
        [name: string]: onForceMove;
    };
    onDeathSource: {
        [name: string]: onDeath;
    };
    onMoveSource: {
        [name: string]: onMove;
    };
    onPickupSource: {
        [name: string]: onPickup;
    };
    onFullTurnCycleSource: {
        [name: string]: onFullTurnCycle;
    };
    onTurnStartSource: {
        [name: string]: onTurnStart;
    };
    onTurnEndSource: {
        [name: string]: onTurnEnd;
    };
    onDrawSelectedSource: {
        [name: string]: onDrawSelected;
    };
    onProjectileCollisionSource: {
        [name: string]: onProjectileCollision;
    };
    onTeleportSource: {
        [name: string]: onTeleport;
    };
    onSpawnSource: {
        [name: string]: onSpawn;
    };
};
export default _default;
