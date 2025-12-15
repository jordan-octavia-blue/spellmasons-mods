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
    math,
} = globalThis.SpellmasonsAPI;
const { getUniqueSeedString, chooseOneOfSeeded, seedrandom, randFloat } = rand;
const { CardRarity, probabilityMap, CardCategory, Faction, UnitSubType, UnitType } = commonTypes;
const { addWarningAtMouse, drawUICirclePrediction } = PlanningView;
const { playDefaultSpellSFX, oneOffImage } = cardUtils;
const {containerSpells} = PixiUtils;
const { skyBeam } = VisualEffects;
const { allUnits } = units;
const { addUnitTarget, refundLastSpell, getCurrentTargets, addTarget, defaultTargetsForAllowNonUnitTargetTargetingSpell} = cards;
const { isUnit, addModifier } = Unit;
const { getOrInitModifier } = cardsUtil;
const { sortCosestTo } = math;
import type { HasSpace } from '../../types/entity/Type';
import type { Vec2 } from '../../types/jmath/Vec';
import type { IUnit } from '../../types/entity/Unit';
import type Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';
const targetArrowCardId = 'Target Arrow';
const id = 'Target Random';
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Targeting,
        supportQuantity: false,
        manaCost: 8,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/target around.png',
        replaces: [targetArrowCardId],
        requiresFollowingCard: true,
        description: ['Targets a random entity.'],
        allowNonUnitTarget: true,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            const targets = getCurrentTargets(state);
            //I figure that radius should be sufficient to encompass the whole map
            const unTargetedUnits = underworld.getEntitiesWithinDistanceOfTarget(state.casterUnit, 1000000000000, prediction).filter(hs => !targets.includes(hs));
            const seed = seedrandom(`${getUniqueSeedString(underworld, state.casterPlayer)}${state.casterUnit.mana}${state.casterUnit.manaMax}${state.casterUnit.stamina}${state.casterPlayer?.inventory}`);
            //add the random target
            addTarget(chooseOneOfSeeded(unTargetedUnits, seed), state, underworld, prediction);
            return state;
        },
    },
};
export default spell;