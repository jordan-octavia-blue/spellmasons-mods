import { getCurrentTargets, Spell } from '../../../cards/index';
import { CardCategory } from '../../../types/commonTypes';
import { playDefaultSpellSFX } from '../../../cards/cardUtils';
import { CardRarity, probabilityMap } from '../../../types/commonTypes';
import { defaultPushDistance, forcePushToDestination, forcePushTowards } from '../../../effects/force_move';
import { dash_id } from '../../../cards/dash';

export const lungeId = 'Lunge';
const spell: Spell = {
    card: {
        id: lungeId,
        category: CardCategory.Movement,
        supportQuantity: true,
        sfx: 'dash',
        manaCost: 0,
        staminaCost: 10,
        healthCost: 0,
        expenseScaling: 0,
        probability: probabilityMap[CardRarity.RUNIC],
        thumbnail: 'spellIconFling.png',
        description: 'A rabid lunge towards the cast location.',
        allowNonUnitTarget: true,
        ignoreRange: true,
        effect: async (state, card, quantity, underworld, prediction) => {
            playDefaultSpellSFX(card, prediction);
            await forcePushTowards(state.casterUnit, state.castLocation, defaultPushDistance * quantity * 1.25, underworld, prediction, state.casterUnit);
            return state;
        },
    },
};
export default spell;
