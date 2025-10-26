/// <reference path="../../globalTypes.d.ts" />
const {
  Unit,
  commonTypes,
  cards,
  math,
} = globalThis.SpellmasonsAPI
const { isUnit } = Unit;
const { CardCategory, CardRarity, probabilityMap } = commonTypes;
const {getCurrentTargets, addTarget} = cards;
import type { Vec2 } from '../../types/jmath/Vec';
import type { Spell } from '../../types/cards';
import { pillarId } from './raise_pillar';
const { sortCosestTo } = math

const id = 'Target Pillar';
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Targeting,
    supportQuantity: true,
    manaCost: 10,
    healthCost: 0,
    expenseScaling: 1,
    probability: probabilityMap[CardRarity.SPECIAL],
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconTargetPillar.png',
    requiresFollowingCard: true,
    requires: [pillarId],
    ignoreRange: true,
    description: 'Adds 5 of the closest pillars per stack as targets for subsequent spells.',
    allowNonUnitTarget: true,
    effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
      let targets: Vec2[] = getCurrentTargets(state);
      const pillarsPerStack = 5
      targets = targets.length ? targets : [state.castLocation];
      const potentialTargets = underworld.getPotentialTargets(prediction)
        .filter(t => isUnit(t) && t.unitSourceId === 'pillar').sort(sortCosestTo(state.casterUnit)).slice(0, pillarsPerStack * quantity);


      const newTargets = potentialTargets;
      for (let newTarget of newTargets) {
        addTarget(newTarget, state, underworld, prediction);
      }

      return state;
    },
  },
};
export default spell;