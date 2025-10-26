import * as Unit from '../entity/Unit';
import { EffectState, Spell } from './index';
import Underworld from '../Underworld';
import * as Pickup from '../entity/Pickup';
export declare const purifyCardId = "purify";
declare const spell: Spell;
export declare function apply(thing: Unit.IUnit | Pickup.IPickup, underworld: Underworld, prediction: boolean, state: EffectState): void;
export default spell;
