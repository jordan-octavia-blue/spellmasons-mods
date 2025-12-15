import type { Mod } from "../types/types/commonTypes";
import chaosSummon from "./cards/chaos_summon";
import unstable from "./cards/unstable";
import slime from "./cards/slime";
import growth from './cards/growth';
import damocles from './cards/damocles';
import tranqilizer from './cards/tranquilizer';
import cleave from './cards/cleave';
import flurry_dash from './cards/flurry_dash';
import target_around from './cards/target_around';
import target_random from './cards/target_random';
const mod: Mod = {
    modName: 'Mana Evolution',
    author: 'Charlie Heck',
    description: "Adds new upgrades to existing spells that change their playstyles and uses in interesting ways.",
    screenshot: 'TODO',
    spells: [
        chaosSummon,
        unstable,
        slime,
        growth,
        damocles,
        tranqilizer,
        cleave,
        flurry_dash,
        target_around,
        target_random
    ],
    spritesheet: 'images/spritesheet.json',
    sfx: {},
};

export default mod;