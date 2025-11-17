const {
    Pickup,
    Unit,
    commonTypes,
    cardsUtil,
} = globalThis.SpellmasonsAPI;
const { CardCategory, CardRarity, probabilityMap } = commonTypes;
const { getOrInitModifier } = cardsUtil;
import type { Spell } from '../../types/cards/index';
import type Underworld from '../../types/Underworld';
import type { IUnit } from "../../types/entity/Unit";

export const id = 'Ephemerate';
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number, extra?: any) {
    const modifier = getOrInitModifier(unit, id, {
        isCurse: false, quantity, originalQuantity: quantity
    }, () => {
        Unit.addEvent(unit, id);
    });
}
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Movement,
        manaCost: 30,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.FORBIDDEN],
        thumbnail: 'spellmasons-mods/RunicAlphabet/graphics/spellIconEphemerate.png',
        description: `Causes the caster to phase out of reality, allowing them to phase back in anywhere on the map. Warning: Excessive warping may incur true damage to the caster.`,
        allowNonUnitTarget: true,
        supportQuantity: true,
        effect: async (state, card, quantity, underworld, prediction) => {
            const pickupSource = Pickup.pickups.find(p => p.name == Pickup.PORTAL_YELLOW_NAME);
            if (pickupSource) {
                if (state.casterPlayer) { }
                const pickupInst = Pickup.create({
                    pos: state.casterUnit,
                    pickupSource,
                    logSource: 'ephemerate.ts'
                }, underworld, prediction);

            }
            if (state.casterPlayer && quantity >= 2) {
                Unit.addModifier(state.casterUnit, id, underworld, prediction, quantity - 1);
            }
            return state;
        },
    },
    modifiers: {
        add
    },
    events: {
        onSpawn: (unit: IUnit, underworld: Underworld, prediction: boolean) => {
            const pickupSource = Pickup.pickups.find(p => p.name == Pickup.PORTAL_YELLOW_NAME);
            const modifier = unit.modifiers[id];
            if (pickupSource && modifier && modifier.quantity >= 0) {
                if (unit) { }
                modifier.quantity -= 1;
                if (modifier.originalQuantity >= 3 && modifier.originalQuantity - modifier.quantity >= 3) {
                    // Take 10 true damage for each warp beyond the first two
                    Unit.takeDamage({ unit, amount: 10 * (modifier.originalQuantity - modifier.quantity), pureDamage: true }, underworld, prediction);
                }
                if (modifier.quantity >= 0) {
                    const pickupInst = Pickup.create({
                        pos: unit,
                        pickupSource,
                        logSource: 'ephemerate.ts'
                    }, underworld, prediction);
                }

            } else if (modifier && modifier.quantity <= 0) {
                Unit.removeModifier(unit, id, underworld);
            }
        }
    }
};
export default spell;
