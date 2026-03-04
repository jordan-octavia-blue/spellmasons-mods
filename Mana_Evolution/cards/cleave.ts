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
    Clone
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
const { doCloneUnit } = Clone;
import type { HasSpace } from '../../types/entity/Type';
import type { Vec2 } from '../../types/jmath/Vec';
import type { IUnit } from '../../types/entity/Unit';
import type Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';







const unstableId = 'Unstable';
const slashCardId = 'Slash';
const id = 'Cleave';
const damage = 30;
const delayBetweenAnimationsStart = 400;
const animationPath = 'spellHurtCuts';
const scale = 1.5;
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Damage,
        supportQuantity: false,
        manaCost: 20,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/cleave.png',
        replaces: [slashCardId],
        requiresFollowingCard: false,
        description: ['Deals 30 damage. Units killed by this spell will be split into 2 corpses.'],
        allowNonUnitTarget: false,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            // .filter: only target living units
            const targets = state.targetedUnits.filter(u => u.alive)
            let delayBetweenAnimations = delayBetweenAnimationsStart;
            // Note: quantity loop should always be INSIDE of the targetedUnits loop
            // so that any quantity-based animations will play simultaneously on multiple targets
            // but sequentially within themselves (on a single target, e.g. multiple hurts over and over)
            for (let q = 0; q < quantity; q++) {
                let fatalDamage = false;
                if (!prediction && !globalThis.headless) {
                    playDefaultSpellSFX(card, prediction);
                    for (let unit of targets) {
                        const spellEffectImage = oneOffImage(unit, animationPath, containerSpells);
                        if (spellEffectImage) {
                            // Randomize rotation a bit so that subsequent slashes don't perfectly overlap
                            spellEffectImage.sprite.rotation = randFloat(-Math.PI / 6, Math.PI / 6);
                            if (q % 2 == 0) {
                                // Flip every other slash animation so that it comes from the other side
                                spellEffectImage.sprite.scale.x = -1;
                            }
                            // Scale for MEGA SLASH
                            spellEffectImage.sprite.scale.x *= scale;
                            spellEffectImage.sprite.scale.y *= scale;
                        }
                        if (damage >= unit.health) {
                            fatalDamage = true;
                        }
                        Unit.takeDamage({
                            unit: unit,
                            amount: damage,
                            sourceUnit: state.casterUnit,
                            fromVec2: state.casterUnit,
                        }, underworld, prediction);
                        if (fatalDamage && !unit.alive) {
                            const clone = doCloneUnit(unit, underworld, prediction, state.casterUnit, { x: unit.x + 10, y: unit.y });
                            if (clone) {
                                // Add corpse clones to target list
                                addTarget(clone, state, underworld, prediction);
                            }
                        }
                    }
                    // Wait some delay between attacks
                    await new Promise(resolve => setTimeout(resolve, delayBetweenAnimations));
                    // Juice: Speed up subsequent hits
                    delayBetweenAnimations *= 0.80
                    // Don't let it go below 20 milliseconds
                    delayBetweenAnimations = Math.max(20, delayBetweenAnimations);
                } else {
                    for (let unit of targets) {
                        if (damage > unit.health) {
                            fatalDamage = true;
                        }
                        Unit.takeDamage({
                            unit: unit,
                            amount: damage,
                            sourceUnit: state.casterUnit,
                            fromVec2: state.casterUnit,
                        }, underworld, prediction);
                        if (fatalDamage) {
                            const clone = doCloneUnit(unit, underworld, prediction, state.casterUnit, { x: unit.x, y: unit.y });
                            if (clone) {
                                // Add corpse clones to target list
                                addTarget(clone, state, underworld, prediction);
                            }
                        }
                    }
                }
            }

            if (targets.length == 0) {
                refundLastSpell(state, prediction, 'No valid targets. Cost refunded.');
            }
            return state;
        },
    },
};
export default spell;