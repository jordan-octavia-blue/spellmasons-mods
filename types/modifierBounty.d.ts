import * as Unit from './entity/Unit';
import Underworld from './Underworld';
export declare const bountyId = "Bounty";
export declare const bountyColor = 16768100;
export default function registerBounty(): void;
export declare function placeRandomBounty(bountyHunter: Unit.IUnit | undefined, underworld: Underworld, prediction: boolean): void;
export declare function getActiveBounties(bountyHunter: Unit.IUnit, underworld: Underworld, prediction: boolean): Unit.IUnit[];
