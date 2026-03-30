import { HasSpace } from "./entity/Type";
import { IUnit } from "./entity/Unit";
import type Underworld from "./Underworld";
export declare function getLiquidDamageMultiplier(underworld: Underworld): number;
export declare function doLiquidEffect(underworld: Underworld, unit: IUnit, prediction: boolean, sourceUnit?: IUnit): void;
export declare const LIQUID_MASK = "liquid-mask";
export declare function add(entity: HasSpace, underworld: Underworld, prediction: boolean, sourceUnit?: IUnit): void;
export declare function remove(entity: HasSpace): void;
