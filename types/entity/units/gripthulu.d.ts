import { type UnitSource } from './index';
import { Vec2 } from '../../jmath/Vec';
export declare const gripthulu_id = "gripthulu";
declare const unit: UnitSource;
export declare function animateDrag(start: Vec2, end: Vec2): Promise<void>;
export default unit;
export declare const gripthuluAction = "Gripthulu Magic";
export declare function registerGripthuluAction(): void;
