/// <reference path="../../globalTypes.d.ts" />
const {
  commonTypes,
  Unit,
  colors,
  math,
  config,
  Vec,
  cards,
  PixiUtils,
  moveWithCollision,
  modifierSummonerSickness,
  JImage,
  FloatingText,
  Arrow,
  Purify,
} = globalThis.SpellmasonsAPI
const {clone} = Vec;
const floatingText = FloatingText.default;
const { getCurrentTargets } = cards;
const { containerProjectiles } = PixiUtils;
const { makeForceMoveProjectile } = moveWithCollision;
const {CardCategory, CardRarity, probabilityMap} = commonTypes;
const { summoningSicknessId } = modifierSummonerSickness;

import type { Vec2 } from '../../types/jmath/Vec';
import type { HasSpace } from '../../types/entity/Type';
import type { Modifier } from '../../types/cards/util';
import type { Spell } from '../../types/cards';
import type Image from '../../types/graphics/Image'
import type Underworld from '../../types/Underworld';
import { IImageAnimated } from '../../types/graphics/Image';
import { bloodArrowCardId } from './bloodied_arrow';
const damage = 20;
const corpseDecayId = 'Corpse Decay';
interface CurseData {
  modId: string,
  modifier: Modifier
}
const STERILE_ARROW_ID = 'Sterile Arrow'
const serileArrowEffect = Arrow.arrowEffect(1, STERILE_ARROW_ID)
const spell: Spell = {
  card: {
    id: STERILE_ARROW_ID,
    category: CardCategory.Curses,
    probability: probabilityMap[CardRarity.UNCOMMON],
    manaCost: 0,
    healthCost: 15,
    expenseScaling: 1,
    supportQuantity: true,
    ignoreRange: true,
    // so that you can fire the arrow at targets out of range
    allowNonUnitTarget: true,
    // This ensures that "target scamming" doesn't work with target arrow
    // due to it being able to fire out of range
    noInitialTarget: true,
    requiresFollowingCard: false,
    animationPath: '',
    replaces: [bloodArrowCardId],
    sfx: '',
    thumbnail: 'spellmasons-mods/The_Doom_Scroll/graphics/spellIconSterileArrow.png',
    description: 'Conjures a mystical arrow that deals 20 damage and TRANSFERS curses from the caster to the victim.',
    effect: async (state, card, quantity, underworld, prediction) => serileArrowEffect(state, card, quantity, underworld, prediction).then((state) => {
      Purify.apply(state.casterUnit, underworld, prediction, state)
      return state;
    }),
  },
  events: {
    onProjectileCollision: ({ unit, pickup, underworld, projectile, prediction }) => {
      if (projectile.state && projectile.sourceUnit) {
        if (unit) {
            Unit.takeDamage({
                      unit: unit,
                      amount: damage,
                      sourceUnit: projectile.sourceUnit,
                      fromVec2: projectile.startPoint,
                      thinBloodLine: true,
                    }, underworld, prediction);
            const modifiersToExclude = [summoningSicknessId, corpseDecayId]
              const curses: CurseData[] = Object.entries(projectile.sourceUnit.modifiers)
                .map(([id, mod]) => ({ modId: id, modifier: mod }))
                .filter(x => x.modifier.isCurse)
                .filter(x => !modifiersToExclude.includes(x.modId));
            for (let curse of curses) {
              if (!prediction) {
                floatingText({ coords: unit, text: curse.modId });
              }
              if (unit.alive) {
                  const quantityToAdd = curse.modifier.quantity;
                  Unit.addModifier(unit, curse.modId, underworld, prediction, quantityToAdd, curse.modifier);
              }
            }
        } else {
          // There is no support for adding multiple vector locations as targets
          projectile.state.castLocation = projectile.pushedObject;
        }
      } else {
        console.error("State was not passed through projectile");
      }
    }
  }
};
export default spell;