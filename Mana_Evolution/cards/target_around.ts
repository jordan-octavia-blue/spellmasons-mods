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
    TargetCircle
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
const { animateTargetCircle } = TargetCircle;
import type { HasSpace } from '../../types/entity/Type';
import type { Vec2 } from '../../types/jmath/Vec';
import type { IUnit } from '../../types/entity/Unit';
import type Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';
const circleId = 'Target Circle';
const baseRadius = 120;
const id = 'Target Around';
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Targeting,
        supportQuantity: true,
        manaCost: 20,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.COMMON],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/target around.png',
        replaces: [circleId],
        requiresFollowingCard: true,
        description: ['Targets entities within a radius around each target, then untargets the initial targets.'],
        allowNonUnitTarget: false,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            // Slightly different / unique formula for balance purposes:
            // +100% range per quantity, +50% range per radius boost
            const adjustedRange = baseRadius * (quantity + (0.5 * state.aggregator.radiusBoost));

            // Note: This loop must NOT be a for..of and it must cache the length because it
            // mutates state.targetedUnits as it iterates.  Otherwise it will continue to loop as it grows
            let targets: Vec2[] = getCurrentTargets(state);
            //Save the targets at the start so they can be removed later
            const initialTargets = targets;
            targets = defaultTargetsForAllowNonUnitTargetTargetingSpell(targets, state.castLocation, card);
            const length = targets.length;
            const animateCircles = [];
            for (let i = 0; i < length; i++) {
                const target = targets[i];
                if (!target) {
                    continue;
                }
                // Draw visual circle for prediction
                if (prediction) {
                    drawUICirclePrediction(target, adjustedRange, 0xffffff, !outOfRange ? 'Target Radius' : undefined);
                } else {
                    animateCircles.push({ pos: target, radius: adjustedRange });
                }
                const withinRadius = underworld.getEntitiesWithinDistanceOfTarget(
                    target,
                    adjustedRange,
                    prediction
                );
                // Sort by distance to circle center
                withinRadius.sort(sortCosestTo(target));
                // Add entities to target
                withinRadius.forEach(e => addTarget(e, state, underworld, prediction));
            }
            await animateTargetCircle(animateCircles, underworld, prediction);
            //clear the initial targets off the list of targets
            state.targetedPickups = state.targetedPickups.filter(p => !initialTargets.includes(p));
            state.targetedUnits = state.targetedUnits.filter(u => !initialTargets.includes(u));

            return state;
        },
    },
};
export default spell;