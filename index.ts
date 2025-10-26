import type * as commonTypes from './types/types/commonTypes';

import UndeadBlade from './undead_blade/undead_blade';
import Wodes_Grimoire from './Wodes_Grimoire/Index';
import Renes_Gimmicks from './Renes_gimmicks/Index';
import DaiNekoIchis_TomeOfSpells from './DaiNekoIchis_TomeOfSpells/Index';
import BogiacsSpells from './Bogiacs_Spells/BogiacsSpells';
import Doom_Scroll from './The_Doom_Scroll/Doom_Scroll';
import Runic_Alphabet from './RunicAlphabet/RunicAlphabet';

const mods: commonTypes.Mod[] = [
    UndeadBlade,
    Wodes_Grimoire,
    Renes_Gimmicks,
    DaiNekoIchis_TomeOfSpells,
    BogiacsSpells,
    Doom_Scroll,
    Runic_Alphabet,
];
globalThis.mods = globalThis.mods !== undefined ? [...globalThis.mods, ...mods] : mods;
console.log('Mods: Add mods', globalThis.mods);