import { Mod } from '../types/types/commonTypes';
import assimilate from './cards/assimilate';
import bloodied_arrow from './cards/bloodied_arrow';
import sterile_arrow from './cards/sterile_arrow';
import bloodthorn_arrow from './cards/bloodthorn_arrow';
import earth_push from './cards/earth_push';
import raise_altar from './cards/raise_altar'
import raise_pillar from './cards/raise_pillar';
import raise_wall from './cards/raise_wall';
import sunlight from './cards/sunlight';
import target_pillar from './cards/target_pillar';
import target_stomp from './cards/target_stomp';
import wind_explosion from './cards/wind_explosion';
import wind_tunnel from './cards/wind_tunnel';
import pillar from "./entity/pillar";
import altar, { modifierRemoveOnDeath } from "./entity/altar";
///<reference path="..globalTypes.d.ts"/>
const mod: Mod = {
    modName: 'The Doom Scroll',
    author: 'Bug Jones, Dorioso Aytario',
    description: 'Adds a variety of interesting new cards to support existing builds as well as introducing a new build.',
    screenshot: 'spellmasons-mods/The_Doom_Scroll/graphics/Doom_Scroll.png',
    spells: [
        assimilate,
        bloodied_arrow,
        bloodthorn_arrow,
        earth_push,
        raise_pillar,
        raise_altar,
        raise_wall,
        raise_altar,
        sterile_arrow,
        sunlight,
        target_pillar,
        target_stomp,
        wind_explosion,
        wind_tunnel,
        sterile_arrow,
    ],
    units: [
        pillar,
        altar,
    ],
    events: [modifierRemoveOnDeath],
    spritesheet: 'spellmasons-mods/The_Doom_Scroll/graphics/spritesheet.json'
};
export default mod;