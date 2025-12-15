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
const growthId = 'Growth'
const empowerId = 'Empower';
const id = 'growth';
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Blessings,
        supportQuantity: false,
        manaCost: 30,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/growth.png',
        replaces: [empowerId],
        requiresFollowingCard: false,
        description: ['Inflicts the Boss Modifier growth, Causing the affected unit to get stronger each turn.'],
        allowNonUnitTarget: false,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            let targets: Vec2[] = getCurrentTargets(state);
            targets = targets.length ? targets : [state.castLocation];
            targets.forEach(t => {
                if (isUnit(t)) {
                    addModifier(t, growthId, underworld, prediction, 1);
                }
            })

            return state;
        },
    },
};
export default spell;