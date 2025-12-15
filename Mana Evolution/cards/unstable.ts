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
const unstableId = 'Unstable';
const displaceId = 'displace'
const id = 'Unstable';
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Blessings,
        supportQuantity: false,
        manaCost: 20,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.SPECIAL],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/unstable.png',
        replaces: [displaceId],
        requiresFollowingCard: false,
        description: ['Inflicts the Boss Modifier Unstable, Causing the affected unit to teleport to a random location each turn.'],
        allowNonUnitTarget: false,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            let targets: Vec2[] = getCurrentTargets(state);
            targets = targets.length ? targets : [state.castLocation];
            targets.forEach(t => {
                if (isUnit(t)) {
                    addModifier(t, unstableId, underworld, prediction, 1);
                }
            })

            return state;
        },
    },
};
export default spell;