/// <reference path="../../globalTypes.d.ts" />
import Underworld from '../../types/Underworld';
import type { Spell } from '../../types/cards/index';
import { IUnit } from '../../types/entity/Unit';

const {
    cardUtils,
    commonTypes,
    cards,
    FloatingText
} = globalThis.SpellmasonsAPI;

const { refundLastSpell } = cards;
const Unit = globalThis.SpellmasonsAPI.Unit;
const { playDefaultSpellSFX } = cardUtils;
const { CardCategory, probabilityMap, CardRarity } = commonTypes;
const Events = globalThis.SpellmasonsAPI.Events;


const cardId = 'Fast Forward';
const spell: Spell = {
    card: {
        id: cardId,
        category: CardCategory.Soul, //Theres no "other" category
        supportQuantity: false,
        manaCost: 25,
        healthCost: 0,
        expenseScaling: 1.5,
        probability: probabilityMap[CardRarity.RARE],
        thumbnail: 'spellmasons-mods/Wodes_Grimoire/graphics/icons/spelliconFastForward.png',
        sfx: 'push', //TODO
        description: [`Shunt the target forward through time. Causes progression of spell effects but does not affect cooldowns.`], //TODO: better deffinition
        effect: async (state, card, quantity, underworld, prediction) => {
            //Living units
            const targets = state.targetedUnits.filter(u => u.alive);
            // Note: quantity loop should always be INSIDE of the targetedUnits loop
            // so that any quantity-based animations will play simultaneously on multiple targets
            // but sequentially within themselves (on a single target, e.g. multiple hurts over and over)
            if (!prediction && !globalThis.headless) {
                playDefaultSpellSFX(card, prediction);
                for (let unit of targets) {
                    // Delay floating text so it doesn't overlap with
                    // any floating text triggered when procEvents is invoked
                    setTimeout(() => {
                        FloatingText.default({
                            coords: unit,
                            text: `Fast Forward`,
                            style: { fill: '#ff0000', strokeThickness: 1 }
                        });
                    }, 200);
                    //const spellEffectImage = oneOffImage(unit, animationPath, containerSpells); //figure this out
                    procEvents(unit, underworld, prediction);
                }
            } else {
                for (let unit of targets) {
                    //Does spell effect for underworld
                    procEvents(unit, underworld, prediction);

                }
            }
            //Refund if no targets
            if (targets.length == 0) {
                refundLastSpell(state, prediction, 'No targets chosen, mana refunded');
            }
            return state;
        },

    },
};
async function procEvents(unit: IUnit, underworld: Underworld, prediction: boolean) {
    //onTurnStart events first for order.
    for (let i = 0; i < unit.events.length; i++) {
        const eventName = unit.events[i];
        if (eventName) {
            //Made into function because eventName points to a modifier (probably) whose arguments need to be pass in.
            const fns = Events.default.onTurnStartSource[eventName];
            if (fns) {
                await fns(unit, underworld, prediction, unit.faction); //Returns boolean, but ignored.
            }
        }
    }
    for (let i = 0; i < unit.events.length; i++) {
        const eventName = unit.events[i];
        if (eventName) {
            const fne = Events.default.onTurnEndSource[eventName];
            if (fne) {
                await fne(unit, underworld, prediction, unit.faction);
            }
        }
    }
}
export default spell;
