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
    JImage,
    moveWithCollision,
    Vec,
    
} = globalThis.SpellmasonsAPI;
const { getUniqueSeedString, chooseOneOfSeeded, seedrandom, randFloat } = rand;
const { CardRarity, probabilityMap, CardCategory, Faction, UnitSubType, UnitType } = commonTypes;
const { addWarningAtMouse, drawUICirclePrediction } = PlanningView;
const { playDefaultSpellSFX, oneOffImage } = cardUtils;
const {containerSpells, containerProjectiles} = PixiUtils;
const { skyBeam } = VisualEffects;
const { allUnits } = units;
const { addUnitTarget, refundLastSpell, getCurrentTargets, addTarget, defaultTargetsForAllowNonUnitTargetTargetingSpell} = cards;
const { isUnit, addModifier } = Unit;
const { getOrInitModifier } = cardsUtil;
const { sortCosestTo } = math;
const {makeForceMoveProjectile} = moveWithCollision;
const {subtract, getEndpointOfMagnitudeAlongVector, getAngleBetweenVec2s} = Vec;
const {create} = JImage;
import type { HasSpace } from '../../types/entity/Type';
import type { Vec2 } from '../../types/jmath/Vec';
import type { IUnit } from '../../types/entity/Unit';
import type Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';
import type { IImageAnimated } from '../../types/graphics/Image';

const phantomArrowCardId = 'Phantom Arrow';
const freezeCardId = 'freeze';
const tranquilizerId = 'Tranquilizer';
const damageDone = 0;
const sleepStacks = 2;
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) {
    const modifier = getOrInitModifier(unit, tranquilizerId, { isCurse: true, quantity, originalstat: unit.attackRange, origanalSpeed: unit.moveSpeed }, () => {
        Unit.addEvent(unit, tranquilizerId);
        unit.attackRange = 0;
        unit.moveSpeed = 0;
    });
}
function remove(unit: IUnit, underworld: Underworld) {
    //Give back ability to attack when debuff is gone
    if (unit.modifiers && unit.modifiers[tranquilizerId]) {
        const originalRange = unit.modifiers[tranquilizerId].originalstat;
        const origanalSpeed = unit.modifiers[tranquilizerId].origanlSpeed;
        if (originalRange) {
            unit.attackRange = originalRange;
        }
        if (origanalSpeed) {
            unit.moveSpeed = origanalSpeed;
        }
    }
}
const spell: Spell = {
    card: {
        id: tranquilizerId,
        category: CardCategory.Curses,
        supportQuantity: true,
        manaCost: 40,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.RARE],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/tranquilizer.png',
        // so that you can fire the arrow at targets out of range
        allowNonUnitTarget: true,
        ignoreRange: true,
        requires: [phantomArrowCardId],
        animationPath: '',
        sfx: 'phantomArrow',
        description: ['Fires a tranquilizing dart that deals no damage but inflicts sleep. Sleeping units wake up on taking damage or in a couple turns.'],
        // Phantom arrow has "infinte" pierce built in
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            let targets: Vec2[] = state.targetedUnits;
            targets = targets.length ? targets : [state.castLocation];
            let timeoutToNextArrow = 200;
            for (let i = 0; i < quantity; i++) {
                for (let target of targets) {
                    for (let arrowNumber = 0; arrowNumber < 1; arrowNumber++) {
                        // START: Shoot multiple arrows at offset
                        let casterPositionAtTimeOfCast = state.casterPositionAtTimeOfCast;
                        let castLocation = target;
                        if (arrowNumber > 0) {
                            const diff = subtract(casterPositionAtTimeOfCast, getEndpointOfMagnitudeAlongVector(casterPositionAtTimeOfCast, (arrowNumber % 2 == 0 ? -1 : 1) * Math.PI / 2 + getAngleBetweenVec2s(state.casterPositionAtTimeOfCast, state.castLocation), arrowNumber > 2 ? 40 : 20));
                            casterPositionAtTimeOfCast = subtract(casterPositionAtTimeOfCast, diff);
                            castLocation = subtract(castLocation, diff);
                        }
                        // END: Shoot multiple arrows at offset
                        const startPoint = casterPositionAtTimeOfCast;
                        const velocity = math.similarTriangles(target.x - startPoint.x, target.y - casterPositionAtTimeOfCast.y, math.distance(startPoint, target), config.ARROW_PROJECTILE_SPEED)
                        let image: IImageAnimated | undefined;
                        if (!prediction) {
                            image = create(casterPositionAtTimeOfCast, 'arrow', containerProjectiles)
                            if (image) {
                                image.sprite.rotation = Math.atan2(velocity.y, velocity.x);
                            }
                        }
                        const pushedObject: HasSpace = {
                            x: casterPositionAtTimeOfCast.x,
                            y: casterPositionAtTimeOfCast.y,
                            radius: 1,
                            inLiquid: false,
                            image,
                            immovable: false,
                            beingPushed: false,
                            debugName: 'arrow'
                        }
                        makeForceMoveProjectile({
                            sourceUnit: state.casterUnit,
                            pushedObject,
                            startPoint,
                            velocity,
                            piercesRemaining: 0,
                            bouncesRemaining: 0,
                            collidingUnitIds: [state.casterUnit.id],
                            collideFnKey: tranquilizerId,
                            state,
                        }, underworld, prediction);

                        if (!prediction && !globalThis.headless) {
                            const timeout = Math.max(0, timeoutToNextArrow);
                            await new Promise(resolve => setTimeout(resolve, timeout));
                            // Decrease timeout with each subsequent arrow fired to ensure that players don't have to wait too long
                            timeoutToNextArrow -= 5;
                        }
                    }
                }

            }
            await underworld.awaitForceMoves();
            return state;
        }
    },
    modifiers: {
        add,
        remove
    },
    events: {
        onTooltip: (unit: IUnit, underworld: Underworld) => {
            const modifier = unit.modifiers[tranquilizerId];
            if (modifier) {
                // Set tooltip:
                modifier.tooltip = `Asleep. Wakes on taking damage or in ${modifier.quantity} turns.`;
            }
        },
        onProjectileCollision: ({ unit, underworld, projectile, prediction }) => {
            if (unit) {
                Unit.addModifier(unit, tranquilizerId, underworld, prediction, sleepStacks)
            }
        },
        onTakeDamage: (unit: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit) => {
            const modifier = unit.modifiers[tranquilizerId];
            if (modifier) {
                Unit.removeModifier(unit, tranquilizerId, underworld);
            }
            return amount;
        },
        onTurnEnd: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
            // Decrement how many turns left the unit is frozen
            const modifier = unit.modifiers[tranquilizerId];
            const frozen = unit.modifiers[freezeCardId];
            if (modifier && !frozen) {
                modifier.quantity--;
                if (modifier.quantity == 0) {
                    Unit.removeModifier(unit, tranquilizerId, underworld);
                }
            }
        }
    }
};
export default spell;