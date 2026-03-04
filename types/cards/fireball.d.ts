import { EffectState, ICard, Spell } from './index';
import Underworld from '../Underworld';
export declare const fireballCardId = "Fireball";
declare const spell: Spell;
export declare function fireballEffect(multiShotCount: number, collideFnKey: string, piercesRemaining?: number, bouncesRemaining?: number): (state: EffectState, card: ICard, quantity: number, underworld: Underworld, prediction: boolean, outOfRange?: boolean) => Promise<EffectState>;
export default spell;
