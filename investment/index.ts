import type { Mod } from "../types/types/commonTypes";
import type { Events, Modifiers, ICard } from "../types/cards";
import type { IUnit } from "../types/entity/Unit";
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
import type Underworld from "../types/Underworld";

// Gain 5% of stored SP every level
export const investmentId = 'Investment';
const modifierInvestment: Modifiers = {
    id: investmentId,
    description: ['rune_investment'],
    unitOfMeasure: '%',
    _costPerUpgrade: 80,
    quantityPerUpgrade: 5,
    maxUpgradeCount: 5,
    add: (unit: IUnit, underworld: Underworld, prediction: boolean, quantity: number = 1) => {
      getOrInitModifier(unit, investmentId, { isCurse: false, quantity, keepOnDeath: true }, () => {
        // NOTE: Logic is hard coded in Player.ts resetPlayerForNextLevel so that it only runs once per level
        Unit.addEvent(unit, investmentId);
      });
    },
  };
//mod definition
const mod: Mod = {
    modName: 'Investment Rune',
    author: 'Jo',
    description: "Adds an OP investment rune that gives you a percentage of your SP as interest every round",
    screenshot: 'images/empty.png',
    modifiers: [modifierInvestment],
};
export default mod;