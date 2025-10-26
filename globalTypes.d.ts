
import type ISpellmasonsAPI from './types/api';
import { Mod } from './types/types/commonTypes';

declare global {
    var SpellmasonsAPI: typeof ISpellmasonsAPI;
    var mods: Mod[];
    // true if this instance is the headless server with no visuals or audio, just the game logic
    var headless: boolean;
    var predictionGraphicsGreen: PIXI.Graphics | undefined;
    var predictionGraphicsRed: PIXI.Graphics | undefined;
    var predictionGraphicsWhite: PIXI.Graphics | undefined;
    var predictionGraphicsBlue: PIXI.Graphics | undefined;
    var selectedUnitGraphics: PIXI.Graphics | undefined;
}