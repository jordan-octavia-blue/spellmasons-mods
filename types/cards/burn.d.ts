import { IUnit } from '../entity/Unit';
import { Spell } from './index';
import Underworld from '../Underworld';
export declare const burnCardId = "Burn";
export declare const baseBurnStacks = 1;
declare const spell: Spell;
export declare function applyBurnWithEffect(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number, extra?: {
    [key: string]: any;
}): void;
export default spell;
