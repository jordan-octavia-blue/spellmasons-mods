import type { Mod } from "../types/types/commonTypes";
import type { Events, Modifiers, ICard } from "../types/cards";
import type { IUnit } from "../types/entity/Unit";
// import { IPlayer } from "../../entity/Player";
//import { takeDamage } from "../../entity/Unit";
import bubble_burst from './cards/bubble_burst';
import ephemerate from './cards/ephemerate';
/*
import wild_swipe from './cards/wild_swipe';
import lunge from './cards/lunge';
import werewolf from './units/werewolf';
import { wildSwipeCardId } from "./cards/wild_swipe";
import { lungeId } from "./cards/lunge";
import { werewolf_unit_id } from "./units/werewolf";
import { visualPolymorphPlayerUnit } from "../../cards/polymorph";
import { HasSpace } from "../../entity/Type";
import floatingText from "../../graphics/FloatingText";
*/


import type { Vec2 } from "../types/jmath/Vec";
import type Underworld from "../types/Underworld";
import type { IPlayer } from "../types/entity/Player";

const shieldId = 'shield';
const freezeCardId = 'freeze';
const spellmasonUnitId = 'Spellmason';
const {
    FloatingText,
    Unit,
    Upgrade,
    JImage,
    cardsUtil,
    JPromise,
    cardUtils,
    forcePushAwayFrom,
    forcePushTowards,
    commonTypes,
    CardUI,
    explode,
    PlanningView,
    units,
    rand,
    ParticleCollection,
} = globalThis.SpellmasonsAPI;
const { getOrInitModifier, } = cardsUtil;
const { CardCategory, UnitType } = commonTypes;
const { drawUICircle } = PlanningView;
const { allUnits } = units;
const { raceTimeout } = JPromise;
const { randInt } = rand;
const { upgradeCardsSource } = Upgrade;
const { takeDamage } = Unit;
interface CardCost {
    manaCost: number;
    healthCost: number;
    staminaCost: number;
    soulFragmentCost?: number;
}


///MODIFIERS -----------------------------------
////////////////////////////////////////////////
const HardLandingId = 'Hard Landing';
const modifierHardLanding: Modifiers = {
    id: HardLandingId,
    description: ('Deals damage and does knockback upon spawning.'),
    _costPerUpgrade: 70,
    unitOfMeasure: 'Damage',
    quantityPerUpgrade: 20,
    stage: 'Amount Flat',
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, HardLandingId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, HardLandingId);
        });
    }
};

const vampirismId = 'Vampirism';
const modifierVampirism: Modifiers = {
    id: vampirismId,
    description: 'Permanent Blood Curse, Gain Lifesteal',
    unitOfMeasure: '% Healing',
    stage: "Amount Multiplier",
    _costPerUpgrade: 70,
    quantityPerUpgrade: 20,
    maxUpgradeCount: 5,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, vampirismId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, vampirismId);
        });
        getOrInitModifier(unit, 'Blood Curse', { isCurse: true, quantity, keepOnDeath: true }, () => {
            Unit.addModifier(unit, 'Blood Curse', underworld, prediction, 1);
            Unit.addEvent(unit, 'Blood Curse');
        });
    }
};

const acrobaticsId = 'Acrobatics';
const modifierAcrobatics: Modifiers = {
    id: acrobaticsId,
    description: 'Movement spells now cost Stamina instead of Mana',
    _costPerUpgrade: 200,
    quantityPerUpgrade: 1,
    maxUpgradeCount: 1,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, acrobaticsId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, acrobaticsId);
        });
    }
};

const safetyNumbersId = 'Safety in Numbers';
const modifierSafetyNumbers: Modifiers = {
    id: safetyNumbersId,
    description: 'Grants a shield to allies within radius based on how many allies are nearby at the end of your turn',
    unitOfMeasure: 'shield per ally affected',
    _costPerUpgrade: 150,
    quantityPerUpgrade: 10,
    maxUpgradeCount: 1,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, safetyNumbersId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, safetyNumbersId);
        });
    }
};
/*
const lycanthropyId = 'Lycanthropy';
const modifierLycanthropy: Modifiers = {
    id: lycanthropyId,
    description: 'Unlocks a new primal form usable once per level. Activate by standing still for 3 turns.',
    _costPerUpgrade: 150,
    maxUpgradeCount: 1,
    stage: 'Amount Flat',
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, lycanthropyId, { isCurse: false, quantity, keepOnDeath: true, standingStillTurns: 0, transformed: false, beenTransformed: false, reservedMana: 0, reservedSpells: [], werewolfSpells: [wildSwipeCardId, lungeId], displacedSpells: [], levelLastTransformed: 0 }, () => {
            Unit.addEvent(unit, lycanthropyId);
        });
    },
};
*/
const nimbleId = 'Nimble';
const modifierNimble: Modifiers = {
    id: nimbleId,
    description: 'Gain 10% increased movement speed per stack',
    _costPerUpgrade: 10,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        const player = underworld.players.find(p => p.unit == unit);
        if (player) {
            getOrInitModifier(unit, nimbleId, { isCurse: false, quantity, keepOnDeath: true }, () => { });
            unit.moveSpeed *= (1 + 0.1 * quantity);
        } else {
            console.error(`Cannot add rune ${nimbleId}, no player is associated with unit`);
        }
    },
}

const meanderId = 'Meander';
const modifierMeander: Modifiers = {
    id: meanderId,
    description: 'Decrease movement speed by 10% per stack',
    _costPerUpgrade: -10,
    maxUpgradeCount: 10,
    isMalady: true,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        const player = underworld.players.find(p => p.unit == unit);
        if (player) {
            getOrInitModifier(unit, meanderId, { isCurse: false, quantity, keepOnDeath: true }, () => { });
            unit.moveSpeed *= (1 - 0.1 * quantity);
        } else {
            console.error(`Cannot add rune ${meanderId}, no player is associated with unit`);
        }
    },
};

const BlurId = 'Blur';
const modifierBlur: Modifiers = {
    id: BlurId,
    unitOfMeasure: '% Nullification chance',
    description: 'Gain a % chance to avoid damage',
    _costPerUpgrade: 70,
    quantityPerUpgrade: 1,
    maxUpgradeCount: 5,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, BlurId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, BlurId);
        });
    }

}

const heavyHitterId = 'Heavy Hitter';
const modifierHeavyHitter: Modifiers = {
    id: heavyHitterId,
    description: 'Doubles the cost of damage spells, but they now deal damage again as pure damage',
    _costPerUpgrade: 150,
    quantityPerUpgrade: 1,
    maxUpgradeCount: 1,
    omitForWizardType:['Deathmason'],
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, heavyHitterId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, heavyHitterId);
        });
    }
}

const frozenSolidId = 'Frozen Solid';
const modifierFrozenSolid: Modifiers = {
    id: frozenSolidId,
    description: 'Take no damage when frozen',
    stage: "Amount Override",
    _costPerUpgrade: 100,
    maxUpgradeCount: 1,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, frozenSolidId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, frozenSolidId);
        });
    }
}
/*
const immovableId = 'Immovable';
const modifierImmovable: Modifiers = {
    id: immovableId,
    description: 'Become immune to knockback and pull effects',
    _costPerUpgrade: 120,
    maxUpgradeCount: 1,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, immovableId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, immovableId);
            floatingText({ coords: unit, text: 'Immovable Applied!' });
        });
    }
}
*/
const effervescenceId = 'Effervescence';
const modifierEffervescence: Modifiers = {
    id: effervescenceId,
    description: ('Liquid now heals you instead of dealing damage'),
    _costPerUpgrade: 120,
    unitOfMeasure: '% Healing',
    quantityPerUpgrade: 30,
    maxUpgradeCount: 3,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, effervescenceId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, effervescenceId);
        });
    }

}

const magnetismId = 'Magnetism';
const modifierMagnetism: Modifiers = {
    id: magnetismId,
    description: 'Pull enemies closer to you on turn start',
    _costPerUpgrade: 30,
    unitOfMeasure: 'Units',
    quantityPerUpgrade: 1,
    maxUpgradeCount: 3,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, magnetismId, { isCurse: false, quantity, keepOnDeath: true }, () => {
            Unit.addEvent(unit, magnetismId);
        });
    },
}

const selectiveMemoryId = 'Selective Memory';
const modifierSelectiveMemory: Modifiers = {
    id: selectiveMemoryId,
    description: 'One random spell in your inventory is disabled each level.',
    _costPerUpgrade: -100,
    maxUpgradeCount: 1,
    stage: 'Reactive Effects',
    isMalady: true,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
        getOrInitModifier(unit, selectiveMemoryId, { isCurse: false, quantity, keepOnDeath: true, lastLevel: 0, stolenSpell: 'null' }, () => {
            Unit.addEvent(unit, selectiveMemoryId);
        });
        const player = underworld.players.find(p => p.unit == unit);
        if (player && unit.modifiers[selectiveMemoryId]) {
            if (!player.disabledCards) {
                player.disabledCards = [];
            }
            const availableSpells = player.inventory.filter(card => !player.disabledCards.includes(card));
            const spellStealIndex = randInt(0, player.inventory.length - 1);
            if (availableSpells[spellStealIndex]) {
                player.disabledCards.push(availableSpells[spellStealIndex]);
                //this if statement returns false because the modifier doesn't exist yet
                if (unit.modifiers[selectiveMemoryId]) {
                    unit.modifiers[selectiveMemoryId].stolenSpell = availableSpells[spellStealIndex];
                }
            }
            CardUI.recalcPositionForCards(player, underworld);
            CardUI.syncInventory(undefined, underworld);
        }
    }
}
///EVENTS -----------------------------------
////////////////////////////////////////////////
const hardLandingEvent: Events = {
    id: HardLandingId,
    onSpawn: (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        const modifier = unit.modifiers[HardLandingId];
        if (modifier) {
            const spawnLocation = { x: unit.x, y: unit.y } as Vec2;
            const radius = 100;
            const units = underworld.getUnitsWithinDistanceOfTarget(spawnLocation, radius, prediction).filter(u => u.id != unit.id);
            units.forEach(u => {
                // Deal damage to units
                takeDamage({
                    unit: u,
                    amount: modifier.quantity,
                    sourceUnit: unit,
                    fromVec2: unit,
                }, underworld, prediction);
            });
            if(!prediction){
                ParticleCollection.makeParticleExplosion(spawnLocation, radius / 140, 0xaaaaaa, 0xaaaaaa, prediction);
            }
            PlanningView.runPredictions(underworld);

            units.forEach(u => {
                // Push units away from exploding location
                forcePushAwayFrom(u, spawnLocation, 100, underworld, prediction, unit);
            })

            underworld.getPickupsWithinDistanceOfTarget(spawnLocation, 100, prediction)
                .forEach(p => {
                    // Push pickups away
                    forcePushAwayFrom(p, spawnLocation, 100, underworld, prediction, unit);
                });
            // Wait a bit for floating text otherwise it gets covered by sky beam
            setTimeout(() => {
                FloatingText.default({ coords: spawnLocation, text: HardLandingId, prediction });
            }, 500)
        } else {
            console.error(`Expected to find ${HardLandingId} modifier`)
        }
    }
};

const vampirismEvent: Events = {
    id: vampirismId,
    onDealDamage: (damageDealer: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageReciever?: IUnit) => {
        const modifier = damageDealer.modifiers[vampirismId];
        if (modifier) {
            const healAmount = amount * (modifier.quantity / 100);
            const bc = 'Blood Curse';
            // Remove Blood Curse before taking healing damage
            damageDealer.events = damageDealer.events.filter(e => e != bc);
            Unit.takeDamage({
                unit: damageDealer,
                amount: -healAmount,
                sourceUnit: undefined,
                }, underworld, prediction);
                // Restore blood curse
            Unit.addEvent(damageDealer, 'Blood Curse');
        }

        return amount;
    },
    onTurnStart: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        if (unit.modifiers[vampirismId] && !unit.modifiers['Blood Curse']) {
            getOrInitModifier(unit, 'Blood Curse', { isCurse: true, quantity: unit.modifiers[vampirismId].quantity, keepOnDeath: true }, () => {
                Unit.addModifier(unit, 'Blood Curse', underworld, prediction, 1);
                Unit.addEvent(unit, 'Blood Curse');
            });
        }
    }
}

const acrobaticsEvent: Events = {
    id: acrobaticsId,
    onCostCalculation(player: IPlayer, card: ICard, timesUsedSoFar: number, cardCost: CardCost) {
        const modifier = player.unit.modifiers[acrobaticsId];
        if (modifier) {
            if (card.category == CardCategory.Movement) {
                cardCost.staminaCost = cardCost.manaCost;
                cardCost.manaCost = 0;
            }
            return cardCost;
        }
        return cardCost;
    }
}

const safetyNumbersEvent: Events = {
    id: safetyNumbersId,
    onTurnEnd: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        const modifier = unit.modifiers[safetyNumbersId];
        if (modifier) {
            const allyUnits = explode.explode(unit, 140, 0, 0, unit, underworld, prediction).filter(u => u.faction == unit.faction && u.alive);
            for (let ally of allyUnits) {
                getOrInitModifier(ally, shieldId, { isCurse: false, quantity: modifier.quantity * (allyUnits.length), keepOnDeath: true }, () => {
                    Unit.addModifier(ally, shieldId, underworld, prediction, modifier.quantity * (allyUnits.length));
                    Unit.addEvent(ally, shieldId);
                });
            }
        }
    },
    onDrawSelected: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        if (globalThis.selectedUnitGraphics) {
            drawUICircle(globalThis.selectedUnitGraphics, unit, 140, 0xfff689, 'Safety in Numbers Radius');
        }
    }
}
/*
const lycanthropyEvent: Events = {
    id: lycanthropyId,
    onTurnEnd: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        const modifier = unit.modifiers[lycanthropyId];
        if (modifier) {
            if (modifier.beenTransformed && modifier.levelLastTransformed != underworld.levelIndex) {
                modifier.beenTransformed = false;
            }
            const originalUnit = allUnits[spellmasonUnitId]
            const player = underworld.players.find(p => p.unit == unit);
            if (player && modifier.transformed && originalUnit && modifier.reservedSpells) {
                modifier.transformed = false;
                modifier.standingStillTurns = 0;
                if (!prediction) {
                    visualPolymorphPlayerUnit(unit, originalUnit);
                    unit.mana = modifier.reservedMana;
                    unit.manaMax = unit.mana;
                    const spellsToRestore = modifier.reservedSpells || [];
                    const spellsToYoink = modifier.werewolfSpells || [];
                    player.disabledCards = player.disabledCards.filter(card => !spellsToRestore.includes(card));
                    player.inventory = player.inventory.filter(card => !spellsToYoink.includes(card));
                    let i = 0;
                    const spellsToPutBack = modifier.displacedSpells || [];
                    for (const spell of spellsToPutBack) {
                        player.cardsInToolbar[i] = spell;
                        i++;
                    }
                }
            }
            if (unit.stamina == unit.staminaMax && unit.mana == unit.manaMax && !modifier.beenTransformed) {
                modifier.standingStillTurns++;
                FloatingText.default({ coords: unit, text: 'Still for ' + modifier.standingStillTurns, prediction });
                const toSourceUnit = allUnits[werewolf_unit_id];
                const player = underworld.players.find(p => p.unit == unit);
                if (player && toSourceUnit && unit.unitType === UnitType.PLAYER_CONTROLLED && modifier.standingStillTurns == 3) {
                    if (!prediction) {
                        //Shift Stats
                        unit.stamina += unit.mana;
                        modifier.reservedMana = unit.mana;
                        unit.mana = 0;
                        unit.manaMax = 0;
                        unit.stamina *= 1.5;
                        //transform
                        visualPolymorphPlayerUnit(unit, toSourceUnit);
                        if (!player.disabledCards) {
                            player.disabledCards = [];
                        }
                        //Disable all spells and insert werewolf spells
                        modifier.reservedSpells = player.inventory;
                        player.disabledCards.push(...player.inventory);
                        for (const spell of modifier.werewolfSpells) {
                            const upgrade = upgradeCardsSource.find(u => u.title === spell);
                            if (upgrade) {
                                underworld.forceUpgrade(player, upgrade, true);
                            }
                        }
                        let i = 0;
                        for (const spell of modifier.werewolfSpells) {
                            let priorIndexofWSpell = player.cardsInToolbar.findIndex(card => card == spell);
                            modifier.displacedSpells.push(player.cardsInToolbar[i]);
                            player.cardsInToolbar[i] = spell;
                            player.cardsInToolbar[priorIndexofWSpell] = '';
                            i++;
                        }
                        modifier.transformed = true;
                        modifier.beenTransformed = true;
                    } else {
                    }
                } else if (!toSourceUnit) {
                }
            } else {
                modifier.standingStillTurns = 0;
            }
        }
    },
    onSpawn: (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        const modifier = unit.modifiers[lycanthropyId];
        const originalUnit = allUnits[spellmasonUnitId]
        const player = underworld.players.find(p => p.unit == unit);
        if (originalUnit && modifier && modifier && modifier.transformed && player && unit) {
            visualPolymorphPlayerUnit(unit, originalUnit);
            unit.mana = modifier.reservedMana;
            unit.manaMax = unit.mana;
            const spellsToRestore = modifier.reservedSpells || [];
            const spellsToYoink = modifier.werewolfSpells || [];
            player.disabledCards = player.disabledCards.filter(card => !spellsToRestore.includes(card));
            player.inventory = player.inventory.filter(card => !spellsToYoink.includes(card));
            let i = 0;
            const spellsToPutBack = modifier.displacedSpells || [];
            for (const spell of spellsToPutBack) {
                player.cardsInToolbar[i] = spell;
                i++;
            }
            CardUI.recalcPositionForCards(player, underworld);
            CardUI.syncInventory(undefined, underworld);
        }
    }
}
*/
const blurEvent: Events = {
    id: BlurId,
    onTakeDamage: (unit: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit) => {
        const modifier = unit.modifiers[BlurId];
        if (modifier) {
            // Blur will not negate damage if we are being healed
            if (damageDealer && amount > 0) {
                const seed = rand.seedrandom(rand.getUniqueSeedString(underworld) + `${unit.id}-${damageDealer?.id || 0}`);
                const roll = randInt(1, 100, seed);
                if (roll <= modifier.quantity) {
                    amount = 0;
                    FloatingText.default({ coords: unit, text: BlurId, prediction });
                }
            }
        }

        // Blur does not modify incoming damage
        return amount;
    }
}

const heavyHitterEvent: Events = {
    id: heavyHitterId,
    onCostCalculation(player: IPlayer, card: ICard, timesUsedSoFar: number, cardCost: CardCost) {
        const modifier = player.unit.modifiers[heavyHitterId];
        if (modifier) {
            if (card.category == CardCategory.Damage) {
                cardCost.manaCost *= 2;
                cardCost.staminaCost *= 2;
                cardCost.healthCost *= 2;
                if(cardCost.soulFragmentCost){
                    cardCost.soulFragmentCost *= 2;
                }
            }
            return cardCost;
        }
        return cardCost;
    },
    onDealDamage: (damageDealer: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageReciever?: IUnit) => {
        const modifier = damageDealer.modifiers[heavyHitterId];
        if (modifier && damageReciever) {
            Unit.takeDamage({ unit: damageReciever, amount, pureDamage: true, }, underworld, prediction);
        }
        return amount;
    }
}

const frozenSolidEvent: Events = {
    id: frozenSolidId,
    onTakeDamage: (unit: IUnit, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit) => {
        const modifier = unit.modifiers[frozenSolidId];
        if (modifier) {
            const freezeModifier = unit.modifiers[freezeCardId];
            // If I am frozen, negate damage
            if (freezeModifier && freezeModifier.quantity >= 0) {
                amount = 0;
                FloatingText.default({ coords: unit, text: 'Frozen Solid', prediction });
            }
        }

        return amount;
    }
}

/*
const immovableEvent: Events = {
    id: immovableId,
    onForceMove: (pushedObject: HasSpace, velocity: Vec2, sourceUnit?: IUnit) => {
        let newVelocity = velocity;
        //floatingText({ coords: pushedObject, text: 'immovable event trigger' });
        if (Unit.isUnit(pushedObject)) {
            //floatingText({ coords: pushedObject, text: 'Immovable' });
            const modifier = pushedObject.modifiers[immovableId];
            if (modifier) {
                newVelocity = multiply(0, velocity);
            }
        }
        return newVelocity;
    }
}
*/

const effervescenceEvent: Events = {
    id: effervescenceId,
    onLiquid: (unit: IUnit, currentlyInLiquid: boolean, amount: number, underworld: Underworld, prediction: boolean, damageDealer?: IUnit) => {
        if (unit.modifiers[effervescenceId]) {
            amount = amount * -1 * (unit.modifiers[effervescenceId].quantity / 100);
        }
        return amount;
    }

}

const magnetismEvent: Events = {
    id: magnetismId,
    onTurnStart: async (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        const modifier = unit.modifiers[magnetismId];
        if (modifier) {
            const chargedUnits = underworld.getAllUnits(prediction).filter(u => u.alive && u.faction != unit.faction).slice(0,modifier.quantity);
            const promises = [];
            for (let chargedUnit of chargedUnits) {
                promises.push(forcePushTowards(chargedUnit, unit, 140, underworld, prediction));
            }
            await raceTimeout(2_000, 'magnetism', Promise.all(promises));
        }

    }
}

const selectiveMemoryEvent: Events = {
    id: selectiveMemoryId,
    onSpawn: (unit: IUnit, underworld: Underworld, prediction: boolean) => {
        const modifier = unit.modifiers[selectiveMemoryId];
        const player = underworld.players.find(p => p.unit == unit);
        if (modifier && modifier.lastLevel != underworld.levelIndex && player) {
            modifier.lastLevel = underworld.levelIndex;
            if (!player.disabledCards) {
                player.disabledCards = [];
            }
            if (modifier.stolenSpell != 'null') {
                player.disabledCards = player.disabledCards.filter(card => card != modifier.stolenSpell);
            }
            const availableSpells = player.inventory.filter(card => !player.disabledCards.includes(card));
            const spellStealIndex = randInt(0, availableSpells.length - 1);
            if (availableSpells[spellStealIndex]) {
                player.disabledCards.push(availableSpells[spellStealIndex]);
                modifier.stolenSpell = availableSpells[spellStealIndex];
            }
        }
        CardUI.recalcPositionForCards(player, underworld);
        CardUI.syncInventory(undefined, underworld);
    }
}
//mod definition
const mod: Mod = {
    modName: 'Runic Alphabet',
    author: 'Bug Jones & Dorioso',
    description: "Adds a variety of new runes, and a handful of spells to support them.",
    screenshot: 'spellmasons-mods/RunicAlphabet/graphics/runic_alphabet.png',
    modifiers: [modifierHardLanding,
        modifierVampirism,
        modifierAcrobatics,
        modifierSafetyNumbers,
        //modifierLycanthropy,
        modifierNimble,
        modifierMeander,
        modifierBlur,
        modifierHeavyHitter,
        modifierFrozenSolid,
        modifierEffervescence,
        modifierMagnetism,
        modifierSelectiveMemory,
        //modifierImmovable,
    ],
    events: [hardLandingEvent,
        vampirismEvent,
        acrobaticsEvent,
        safetyNumbersEvent,
        //lycanthropyEvent,
        blurEvent,
        heavyHitterEvent,
        frozenSolidEvent,
        effervescenceEvent,
        magnetismEvent,
        selectiveMemoryEvent,
        //immovableEvent
    ],
    spells: [
        bubble_burst,
        ephemerate,
        //wild_swipe,
        //lunge
    ],
    //units: [werewolf],
    spritesheet: 'spellmasons-mods/RunicAlphabet/graphics/spritesheet.json'
};
export default mod;