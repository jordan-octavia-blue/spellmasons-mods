import Underworld from '../Underworld';
import { EffectState, Spell } from './index';
import { Vec2 } from '../jmath/Vec';
export declare const meteorCardId = "meteor";
declare const spell: Spell;
export declare function meteorProjectiles(meteorLocations: Vec2[], underworld: Underworld, state: EffectState): Promise<void>;
export default spell;
