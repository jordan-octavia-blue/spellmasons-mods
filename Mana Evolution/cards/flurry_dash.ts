const {
    rand,
    Unit,
    config,
    commonTypes,
    cards,
    VisualEffects,
    PlanningView,
    cardUtils,
    units,
    PixiUtils,
    cardsUtil,
    teleport
} = globalThis.SpellmasonsAPI;
const { getUniqueSeedString, chooseOneOfSeeded, seedrandom, randFloat } = rand;
const { CardRarity, probabilityMap, CardCategory, Faction, UnitSubType, UnitType } = commonTypes;
const { addWarningAtMouse } = PlanningView;
const { playDefaultSpellSFX, oneOffImage } = cardUtils;
const {containerSpells} = PixiUtils;
const { skyBeam } = VisualEffects;
const { allUnits } = units;
const { addUnitTarget, refundLastSpell, getCurrentTargets, addTarget} = cards;
const { isUnit, addModifier } = Unit;
const { getOrInitModifier } = cardsUtil;
import type { HasSpace } from '../../types/entity/Type';
import type { Vec2 } from '../../types/jmath/Vec';
import type { IUnit } from '../../types/entity/Unit';
import type Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';

const dash_id = 'Dash';
const id = 'Flurry Dash';
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Movement,
        supportQuantity: false,
        manaCost: 20,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/flurry_dash.png',
        replaces: [dash_id],
        requiresFollowingCard: false,
        description: ['Teleport to each target in sequence.'],
        allowNonUnitTarget: false,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            const targets = getCurrentTargets(state);
            const delayBetweenAnimations = 50;
            for (let target of targets) {
                teleport(state.casterUnit, target, underworld, prediction, true, state.casterUnit);
                await new Promise(resolve => setTimeout(resolve, delayBetweenAnimations));
            }
            return state;
        },
    },
};
export default spell;