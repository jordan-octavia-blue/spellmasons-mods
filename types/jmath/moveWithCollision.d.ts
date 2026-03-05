import { Vec2 } from './Vec';
import { LineSegment } from "./lineSegment";
import Underworld from '../Underworld';
import { HasSpace } from '../entity/Type';
import { IUnit } from '../entity/Unit';
import { EffectState } from '../cards';
export declare enum ForceMoveType {
    PROJECTILE = 0,
    UNIT_OR_PICKUP = 1
}
export interface ForceMove {
    type: ForceMoveType;
    pushedObject: HasSpace;
    velocity: Vec2;
    timedOut?: boolean;
    sourceUnit?: IUnit;
}
export type ForceMoveUnitOrPickup = ForceMove & {
    type: ForceMoveType.UNIT_OR_PICKUP;
    canCreateSecondOrderPushes: boolean;
    velocity_falloff: number;
    alreadyCollided: HasSpace[];
    resolve: () => void;
};
export declare function isForceMoveUnitOrPickup(x: ForceMove): x is ForceMoveUnitOrPickup;
export type ForceMoveProjectile = ForceMove & {
    type: ForceMoveType.PROJECTILE;
    sourceUnit?: IUnit;
    startPoint: Vec2;
    velocity: Vec2;
    piercesRemaining: number;
    bouncesRemaining: number;
    collidingUnitIds: number[];
    collideFnKey: string;
    state: EffectState;
    ignoreCollisionLifetime?: number | undefined;
    emitter?: any;
};
export declare function isForceMoveProjectile(x: ForceMove): x is ForceMoveProjectile;
interface ForceMoveProjectileArgs {
    pushedObject: HasSpace;
    sourceUnit?: IUnit;
    startPoint: Vec2;
    velocity: Vec2;
    piercesRemaining: number;
    bouncesRemaining: number;
    collidingUnitIds: number[];
    collideFnKey: string;
    state: EffectState;
    ignoreCollisionLifetime?: number | undefined;
}
export declare function makeForceMoveProjectile(args: ForceMoveProjectileArgs, underworld: Underworld, prediction: boolean): ForceMove;
export type Circle = {
    radius: number;
} & Vec2;
export declare function isVecIntersectingVecWithCustomRadius(c1: Vec2, c2: Vec2, radius: number): boolean;
export declare function isCircleIntersectingCircle(c1: Circle, c2: Circle): boolean;
export declare function moveAwayFrom(circle: Circle, from: Vec2): void;
export declare function moveAlongVector(startPos: Vec2, normalizedVector: Vec2, distance: number): Vec2;
export declare function normalizedVector(point1: Vec2, point2: Vec2): {
    vector: Vec2 | undefined;
    distance: number;
};
export declare function collideWithLineSegments(circle: Circle, lineSegments: LineSegment[], underworld: Underworld): boolean;
export declare function handleWallCollision(forceMoveInst: ForceMove, underworld: Underworld, deltaTime: number): {
    msUntilCollision: number;
    wall: LineSegment | undefined;
};
export declare function projectVelocityAlongWall(velocity: Vec2, lineSegment: LineSegment): Vec2;
export declare function reflectVelocityOnWall(velocity: Vec2, lineSegment: LineSegment): Vec2;
export declare function moveWithCollisions(mover: Circle, destination: Vec2, circles: HasSpace[], underworld: Underworld): void;
declare function repelCircles(mover: Circle, originalPosition: Vec2, other: Circle, underworld: Underworld, otherIsFixed?: boolean): void;
declare function repelCircleFromLine(mover: Circle, line: LineSegment, underworld: Underworld): boolean;
export declare const testables: {
    repelCircles: typeof repelCircles;
    repelCircleFromLine: typeof repelCircleFromLine;
};
export {};
