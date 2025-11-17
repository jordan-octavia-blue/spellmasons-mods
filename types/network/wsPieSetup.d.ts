import Underworld from '../Underworld';
import { Overworld } from '../Overworld';
export declare function joinRoom(overworld: Overworld, _room_info?: {}, makeRoomIfNonexistant?: boolean): Promise<void>;
export declare function setupPieAndUnderworld(): void;
export declare function isSinglePlayer(): boolean;
export declare function multiplePlayers(underworld: Underworld): boolean;
