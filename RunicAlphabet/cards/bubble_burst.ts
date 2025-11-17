const {
    Unit,
    config,
    cardsUtil,
    commonTypes,
    math,
    Easing,
    PlanningView,
    JPromise,
    cards,
} = globalThis.SpellmasonsAPI;
const { CardCategory, CardRarity, probabilityMap } = commonTypes;
// Cosest
const { sortCosestTo } = math;
const { raceTimeout } = JPromise;
const { easeOutCubic } = Easing;
const { drawUICirclePrediction } = PlanningView;
const { defaultTargetsForAllowNonUnitTargetTargetingSpell, getCurrentTargets } = cards;
import type { HasSpace } from '../../types/entity/Type';
import type { Vec2 } from '../../types/jmath/Vec';
import type { IUnit } from '../../types/entity/Unit';
import type Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';

const SubmergeId = 'Submerge';
interface Circle {
    pos: Vec2;
    radius: number;
}
const timeoutMsAnimation = 2000;

const id = 'Bubble Burst';
const baseRadius = 100;
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Damage,
        supportQuantity: false,
        manaCost: 60,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.RARE],
        thumbnail: 'spellmasons-mods/RunicAlphabet/graphics/spellIconBubbleBurst.png',
        requiresFollowingCard: false,
        description: 'Summons a damaging bubble that pops and deals liquid damage to all units within radius.',
        allowNonUnitTarget: true,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            // Slightly different / unique formula for balance purposes:
            // +100% range per quantity, +50% range per radius boost
            const adjustedRange = baseRadius * (1 + (0.5 * state.aggregator.radiusBoost));

            // Note: This loop must NOT be a for..of and it must cache the length because it
            // mutates state.targetedUnits as it iterates.  Otherwise it will continue to loop as it grows
            let targets: Vec2[] = getCurrentTargets(state);
            const length = targets.length;
            const animateCircles = [];
            let bubbleBoys: IUnit[] = [];
            for (let i = 0; i < length; i++) {
                const target = targets[i];
                if (!target) {
                    continue;
                }
                // Draw visual circle for prediction
                if (prediction) {
                    drawUICirclePrediction(target, adjustedRange, 0xffffff, !outOfRange ? 'Bubble Radius' : undefined);
                } else {
                    animateCircles.push({ pos: target, radius: adjustedRange });
                }
                const withinRadius = underworld.getUnitsWithinDistanceOfTarget(
                    target,
                    adjustedRange,
                    prediction
                );
                // Sort by distance to circle center
                withinRadius.sort(sortCosestTo(target));
                // Add entities to target
                withinRadius.forEach(e => bubbleBoys.push(e));
            }
            for (let unit of bubbleBoys) {
                let submerged = false;
                if (unit.modifiers && unit.modifiers[SubmergeId]) {
                    // Submerged units must have the modifier removed and re-added to properly
                    // trigger the damage event again
                    submerged = true;
                    Unit.removeModifier(unit, SubmergeId, underworld);
                }
                Unit.addModifier(unit, SubmergeId, underworld, prediction);
                if (!submerged) {
                    Unit.removeModifier(unit, SubmergeId, underworld);
                }
            }
            await animateTargetCircle(animateCircles, underworld, prediction);

            return state;
        },
    },
};
export async function animateTargetCircle(circles: Circle[], underworld: Underworld, prediction: boolean, omitTargets: HasSpace[] = []) {
    if (globalThis.headless || prediction) {
        // Animations do not occur on headless, so resolve immediately or else it
        // will just waste cycles on the server
        return Promise.resolve();
    }
    if (circles.length == 0) {
        // Prevent this function from running if there is nothing to animate
        return Promise.resolve();
    }
    // Keep track of which entities have been targeted so far for the sake
    // of making a new sfx when a new entity gets targeted
    const entitiesTargeted: HasSpace[] = [];
    return raceTimeout(timeoutMsAnimation, 'animatedExpand', new Promise<void>(resolve => {
        animateFrame(circles, Date.now(), entitiesTargeted, underworld, resolve, omitTargets)();
    })).then(() => {
        globalThis.predictionGraphicsBlue?.clear();
    });
}

const millisToGrow = 500;
function animateFrame(circles: Circle[], startTime: number, entitiesTargeted: HasSpace[], underworld: Underworld, resolve: (value: void | PromiseLike<void>) => void, omitTargets: HasSpace[] = []) {
    return function animateFrameInner() {
        if (globalThis.predictionGraphicsBlue) {
            globalThis.predictionGraphicsBlue.clear();
            globalThis.predictionGraphicsBlue.lineStyle(2, 0xffffff, 1.0)
            const now = Date.now();
            const timeDiff = now - startTime;
            for (let circle of circles) {
                const { pos, radius } = circle;

                const animatedRadius = radius * easeOutCubic(Math.min(1, timeDiff / millisToGrow));
                globalThis.predictionGraphicsBlue.drawCircle(pos.x, pos.y, animatedRadius);
                globalThis.predictionGraphicsBlue.endFill();
                // Draw circles around new targets
                const withinRadius = underworld.getEntitiesWithinDistanceOfTarget(
                    pos,
                    animatedRadius,
                    false
                );
                withinRadius.forEach(v => {
                    if (omitTargets.includes(v)) {
                        return;
                    }
                    if (!entitiesTargeted.includes(v)) {
                        entitiesTargeted.push(v);
                    }
                    globalThis.predictionGraphicsBlue?.drawCircle(v.x, v.y, config.COLLISION_MESH_RADIUS);
                })
            }
            if (timeDiff > millisToGrow) {
                resolve();
                return;
            } else {
                requestAnimationFrame(animateFrame(circles, startTime, entitiesTargeted, underworld, resolve));
            }
        } else {
            resolve();
        }

    }
}
export default spell;
