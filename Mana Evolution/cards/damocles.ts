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

const rendCardId = 'Rend';
function calculateRendDamage(stack: number): number {
    let damage = 0;
    for (let i = 1; i < stack + 1; i++) {
        damage += i;
    }
    return damage * 10;
}
const id = 'Damocles';
function add(unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) {
    const modifier = getOrInitModifier(unit, id, { isCurse: true, quantity }, () => {
        Unit.addEvent(unit, id);
    });
}
const spell: Spell = {
    card: {
        id,
        category: CardCategory.Curses,
        supportQuantity: true,
        manaCost: 10,
        healthCost: 0,
        expenseScaling: 1,
        probability: probabilityMap[CardRarity.COMMON],
        thumbnail: 'spellmasons-mods/Mana Evolution/images/damocles.png',
        replaces: [rendCardId],
        requiresFollowingCard: false,
        description: ['Summons the Sword of Damocles, which deals damage that scales with stacks in the same pattern as rend. Damage is done next time unit takes damage. Stacks increase every turn.'],
        allowNonUnitTarget: false,
        effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
            let targets: Vec2[] = getCurrentTargets(state);
            targets = targets.length ? targets : [state.castLocation];
            targets.forEach(t => {
                if (isUnit(t)) {
                    addModifier(t, id, underworld, prediction, quantity);
                }
            })

            return state;
        },
    },
    modifiers: {
        add
    },
    events: {
        onTooltip: (unit: IUnit, underworld: Underworld) => {
            const modifier = unit.modifiers[id];
            if (modifier) {
                // Set tooltip:
                modifier.tooltip = `${calculateRendDamage(modifier.quantity)} Extra damage taken on next hit`;
            }
        },
        onTurnEnd: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
            // Decrement how many turns left the unit is frozen
            const modifier = unit.modifiers[id];
            if (modifier) {
                modifier.quantity++;
            }
        },
        onTakeDamage: (unit: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit) => {
            const modifier = unit.modifiers[id];
            if (modifier) {
                Unit.takeDamage({ unit, amount: calculateRendDamage(modifier.quantity), sourceUnit: damageDealer }, underworld, prediction);
                Unit.removeModifier(unit, id, underworld);
            }
            // Damocles does not modify incoming damage
            return amount;
        }
    }
};
export default spell;