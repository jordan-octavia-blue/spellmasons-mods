import Underworld from "../Underworld";
import { Vec2 } from "../jmath/Vec";
import { IUnit } from "../entity/Unit";
export declare const baseExplosionRadius = 140;
export declare function explode(location: Vec2, radius: number, damage: number, pushDistance: number, sourceUnit: IUnit | undefined, underworld: Underworld, prediction: boolean, colorstart?: number, colorEnd?: number, useDefaultSound?: boolean, screenshake?: boolean): IUnit[];
