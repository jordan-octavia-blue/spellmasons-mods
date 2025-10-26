/// <reference path="../../globalTypes.d.ts" />
import Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';
import { IUnit } from '../../types/entity/Unit';

const {
    commonTypes,
    cards,
    cardsUtil,
    FloatingText,
} = globalThis.SpellmasonsAPI;

const { refundLastSpell } = cards;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;

const maxDuration = 3;
const distanceToDamageRatio = 0.05;

const cardId = 'Caltrops';
const spell: Spell = {
    card: {
        id: cardId,
        category: CardCategory.Curses,
        supportQuantity: true,
        manaCost: 30,
        healthCost: 0,
        expenseScaling: 1.5,
        probability: probabilityMap[CardRarity.UNCOMMON],
        thumbnail: 'spellmasons-mods/Renes_gimmicks/graphics/icons/' + cardId + '.png',
        sfx: 'hurt',
        description: [`Target takes some damage it moves. Stacks, casting again replenishes duration up to ${maxDuration} turns. (Updates on turn change, recasts or damage)`],
        effect: async (state, _card, quantity, underworld, prediction) => {
            //Living units
            const targets = state.targetedUnits.filter(u => u.alive);

            //Refund if no targets, this is before mana trails to help save time
            if (targets.length == 0) {
                refundLastSpell(state, prediction, 'No targets damaged, mana refunded');
                return state;
            }
            for (let unit of targets) {
                Unit.addModifier(unit, cardId, underworld, prediction, maxDuration, { amount: quantity });
                if (!prediction) {
                    triggerDistanceDamage(unit, underworld, prediction);
                }
            }
            return state;
        },
    },
    modifiers: {
        add,
    },
    events: {
        //onMove: (unit, newLocation) => {triggerDistanceDamage(unit);return newLocation},
        onTakeDamage: (unit, amount, underworld, prediction) => { triggerDistanceDamage(unit, underworld, prediction); return amount },
        onTurnStart: async (unit, underworld, prediction) => { triggerDistanceDamage(unit, underworld, prediction); },
        onTurnEnd: async (unit, underworld, prediction) => { triggerDistanceDamage(unit, underworld, prediction); },
    },
};

function add(unit: IUnit, _underworld: Underworld, prediction: boolean, quantity: number, extra: any) {
    let firstStack = !unit.events.includes(cardId);
    const modifier = cardsUtil.getOrInitModifier(unit, cardId, {
        isCurse: true, quantity, persistBetweenLevels: false,
    }, () => {
        //Register onTurn
        if (firstStack) {
            SpellmasonsAPI.Unit.addEvent(unit, cardId);
        }
    });
    if (firstStack) {
        modifier.last_x = unit.x;
        modifier.last_y = unit.y;
    }

    if (modifier.quantity > maxDuration) {
        modifier.quantity = maxDuration; //All casts give maxDuration turns, the max duration. When over maxDuration, a new cast was done so update stacks
    }
    if (!prediction) {
        modifier.caltropsCounter = (modifier.caltropsCounter || 0) + extra.amount;
        updateTooltip(unit);
    }
}
function caltropsAmount(castquantity: number) {
    let caltrops = 1;
    if (castquantity > 0) {
        caltrops = castquantity * 1;
    }
    return caltrops;
}
function updateTooltip(unit: IUnit) {
    const modifier = unit.modifiers && unit.modifiers[cardId];
    if (modifier) {
        modifier.tooltip = `When target moves deal ${caltropsAmount(modifier.caltropsCounter)} damage, lasts ${modifier.quantity} turns`
    }
}
function triggerDistanceDamage(unit: IUnit, underworld: Underworld, prediction = false) {
    if (!unit.alive) {
        return;
    }
    const modifier = unit.modifiers && unit.modifiers[cardId];
    let x_diff = unit.x - modifier.last_x;
    let y_diff = unit.y - modifier.last_y;
    if (x_diff == 0 && y_diff == 0) {
        return
    };
    let damage = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
    damage = damage * distanceToDamageRatio * modifier.caltropsCounter;
    damage -= damage % 1;
    if (!modifier || damage < 1) {
        return
    };
    modifier.last_x = unit.x;
    modifier.last_y = unit.y;
    Unit.takeDamage({ unit, amount: damage }, underworld, prediction);
    if (!prediction) {
        FloatingText.default({
            coords: unit,
            text: `${damage} caltrops damage`,
            style: { fill: '#grey', strokeThickness: 1 }
        });
    }
}
export default spell;